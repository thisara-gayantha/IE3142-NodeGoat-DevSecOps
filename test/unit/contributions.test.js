/* global describe, it */
"use strict";

const assert = require("assert");
const ContributionsHandler = require("../../app/routes/contributions");

// Minimal mock db so ContributionsDAO/UserDAO work without MongoDB.
function createMockDb() {
    return {
        collection: name => {
            if (name === "users") {
                return {
                    findOne: (query, callback) => callback(null, {
                        userName: "user2", firstName: "Test", lastName: "User"
                    })
                };
            }
            return {
                update: (query, doc, opts, callback) => callback(null),
                findOne: (query, callback) => callback(null, null)
            };
        }
    };
}

function runUpdate(body, onRender, onNext) {
    const handler = new ContributionsHandler(createMockDb());
    const req = { body: body, session: { userId: 2 } };
    const res = { render: (view, data) => onRender(view, data) };
    const next = err => (onNext ? onNext(err) : onRender("__next__", { err }));
    handler.handleContributionsUpdate(req, res, next);
}

describe("Contributions eval injection fix (V1)", function() {

    it("parses '4*4' as 4 instead of evaluating it to 16", function(done) {
        runUpdate({ preTax: "4*4", afterTax: "0", roth: "0" }, (view, data) => {
            assert.strictEqual(view, "contributions");
            assert.strictEqual(data.preTax, 4, "expected parseInt('4*4') === 4");
            assert.notStrictEqual(data.preTax, 16, "eval must not run");
            done();
        });
    });

    it("still accepts a normal numeric contribution", function(done) {
        runUpdate({ preTax: "10", afterTax: "0", roth: "0" }, (view, data) => {
            assert.strictEqual(data.preTax, 10);
            done();
        });
    });

    it("rejects code input without executing it", function(done) {
        runUpdate({ preTax: "process.exit()", afterTax: "0", roth: "0" }, (view, data) => {
            assert.strictEqual(view, "contributions");
            assert.strictEqual(data.updateError, "Invalid contribution percentages");
            done();
        });
    });
});
