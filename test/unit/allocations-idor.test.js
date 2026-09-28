/* global describe, it */
"use strict";

const assert = require("assert");
const AllocationsHandler = require("../../app/routes/allocations");

function createMockDb(capture) {
    return {
        collection: name => {
            if (name === "allocations") {
                return {
                    find: query => {
                        capture.query = query;
                        return { toArray: cb => cb(null, [{ userId: 2, stocks: 12, funds: 9, bonds: 79 }]) };
                    }
                };
            }
            if (name === "users") {
                return { findOne: (q, cb) => cb(null, { _id: q._id, userName: "user" + q._id, firstName: "Test", lastName: "User" }) };
            }
            return { find: () => ({ toArray: cb => cb(null, []) }), findOne: (q, cb) => cb(null, {}) };
        }
    };
}

describe("Allocations IDOR fix (V4)", function() {
    it("queries the session user's id, not the URL parameter", function(done) {
        const capture = {};
        const handler = new AllocationsHandler(createMockDb(capture));
        const req = { session: { userId: 2 }, params: { userId: "1" }, query: {} };
        const res = { render: () => {
            assert.strictEqual(capture.query.userId, 2, "must use session user 2, not URL param 1");
            assert.notStrictEqual(capture.query.userId, 1, "URL param must be ignored");
            done();
        } };
        handler.displayAllocations(req, res, () => {});
    });
});
