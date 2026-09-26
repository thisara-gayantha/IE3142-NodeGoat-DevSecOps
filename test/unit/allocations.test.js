/* global describe, it */
"use strict";

const assert = require("assert");
const AllocationsDAO = require("../../app/data/allocations-dao").AllocationsDAO;

// Model only the native query operations used here; never evaluate query JavaScript.
function createFixture() {
    const records = [
        { userId: 1, stocks: 0 },
        { userId: 1, stocks: 50 },
        { userId: 1, stocks: 51 },
        { userId: 1, stocks: 99 },
        { userId: 1, stocks: 100 },
        { userId: 2, stocks: 75 }
    ];
    const queries = [];
    const db = {
        collection: name => {
            if (name === "users") {
                return {
                    findOne: (query, callback) => callback(null, {
                        userName: "user" + query._id,
                        firstName: "Test",
                        lastName: "User"
                    })
                };
            }
            assert.strictEqual(name, "allocations");
            return {
                find: query => {
                    queries.push(query);
                    assert.strictEqual(Object.prototype.hasOwnProperty.call(query, "$where"), false);
                    if (query.stocks) {
                        assert.strictEqual(typeof query.stocks.$gt, "number");
                    }
                    return {
                        toArray: callback => callback(null, records.filter(record =>
                            record.userId === query.userId &&
                            (!query.stocks || record.stocks > query.stocks.$gt)
                        ).map(record => Object.assign({}, record)))
                    };
                }
            };
        }
    };
    return { dao: new AllocationsDAO(db), queries };
}

describe("Allocations threshold filtering (V2)", function() {
    [
        { threshold: "50", expected: [51, 99, 100] },
        { threshold: 50, expected: [51, 99, 100] },
        { threshold: "0", expected: [50, 51, 99, 100] },
        { threshold: 0, expected: [50, 51, 99, 100] },
        { threshold: "99", expected: [100] },
        { threshold: 99, expected: [100] }
    ].forEach(testCase => {
        it("filters stocks strictly above " + JSON.stringify(testCase.threshold), function(done) {
            const fixture = createFixture();
            fixture.dao.getByUserIdAndThreshold("1", testCase.threshold, (err, allocations) => {
                assert.ifError(err);
                assert.deepStrictEqual(allocations.map(allocation => allocation.stocks), testCase.expected);
                assert(allocations.every(allocation => allocation.userId === 1));
                assert.strictEqual(allocations[0].userName, "user1");
                assert.strictEqual(fixture.queries.length, 1);
                done();
            });
        });
    });

    [
        -1, "-1", 100, "100", "abc", "50abc", "50.5", 50.5, "1e1", "0x32",
        " 50", "50 ", "50\n", "\n", null, false, true, NaN, Infinity,
        [], ["50"], { $gt: 0 },
        "1'; return 1 == '1", "0' || true || '", "0';while(true){}'"
    ].forEach(threshold => {
        it("rejects invalid threshold " + String(threshold) + " before querying", function(done) {
            const fixture = createFixture();
            fixture.dao.getByUserIdAndThreshold("1", threshold, (err, allocations) => {
                assert(err instanceof Error);
                assert.strictEqual(allocations, null);
                assert.strictEqual(fixture.queries.length, 0);
                done();
            });
        });
    });

    [undefined, ""].forEach(threshold => {
        it("preserves an unfiltered lookup for " + JSON.stringify(threshold), function(done) {
            const fixture = createFixture();
            fixture.dao.getByUserIdAndThreshold("1", threshold, (err, allocations) => {
                assert.ifError(err);
                assert.deepStrictEqual(allocations.map(allocation => allocation.stocks), [0, 50, 51, 99, 100]);
                done();
            });
        });
    });

    it("continues to use the caller-supplied user ID (V4 behavior)", function(done) {
        const fixture = createFixture();
        fixture.dao.getByUserIdAndThreshold("2", "50", (err, allocations) => {
            assert.ifError(err);
            assert.deepStrictEqual(allocations.map(allocation => allocation.userId), [2]);
            assert.strictEqual(allocations[0].stocks, 75);
            done();
        });
    });

    it("preserves the existing error when no allocation exceeds the threshold", function(done) {
        const fixture = createFixture();
        fixture.dao.getByUserIdAndThreshold("2", "99", (err, allocations) => {
            assert.strictEqual(err, "ERROR: No allocations found for the user");
            assert.strictEqual(allocations, null);
            done();
        });
    });
});
