#!/usr/bin/env nodejs

"use strict";

// This script initializes the database.
// Required configuration values are supplied through environment variables.

const { MongoClient } = require("mongodb");
const { db } = require("../config/config");

function requireEnv(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

const USERS_TO_INSERT = [
    {
        "_id": 1,
        "userName": "admin",
        "firstName": "Node Goat",
        "lastName": "Admin",
        "password": requireEnv("NODEGOAT_ADMIN_PASSWORD"),
        "isAdmin": true
    },
    {
        "_id": 2,
        "userName": "user1",
        "firstName": "John",
        "lastName": "Doe",
        "benefitStartDate": "2030-01-10",
        "password": requireEnv("NODEGOAT_USER1_PASSWORD")
    },
    {
        "_id": 3,
        "userName": "user2",
        "firstName": "Will",
        "lastName": "Smith",
        "benefitStartDate": "2025-11-30",
        "password": requireEnv("NODEGOAT_USER2_PASSWORD")
    }
];

const tryDropCollection = (db, name) => {
    return new Promise((resolve) => {
        db.dropCollection(name, (err) => {
            if (!err) {
                console.log(`Dropped collection: ${name}`);
            }

            resolve(undefined);
        });
    });
};

const parseResponse = (err, res, comm) => {
    if (err) {
        console.log("ERROR:");
        console.log(comm);
        console.log(JSON.stringify(err));
        process.exit(1);
    }

    console.log(comm);
    console.log(JSON.stringify(res));
};

// Starting here
MongoClient.connect(db, (err, db) => {
    if (err) {
        console.log("ERROR: connect");
        console.log(JSON.stringify(err));
        process.exit(1);
    }

    console.log("Connected to the database");

    const collectionNames = [
        "users",
        "allocations",
        "contributions",
        "memos",
        "counters"
    ];

    console.log("Dropping existing collections");

    const dropPromises = collectionNames.map(
        (name) => tryDropCollection(db, name)
    );

    Promise.all(dropPromises).then(() => {
        const usersCol = db.collection("users");
        const allocationsCol = db.collection("allocations");
        const countersCol = db.collection("counters");

        countersCol.insert({
            _id: "userId",
            seq: 3
        }, (err, data) => {
            parseResponse(err, data, "countersCol.insert");
        });

        // Do not print password values or complete user objects.
        console.log(`Preparing ${USERS_TO_INSERT.length} seed users`);

        usersCol.insertMany(USERS_TO_INSERT, (err, data) => {
            const finalAllocations = [];

            if (err) {
                console.log("ERROR: insertMany");
                console.log(JSON.stringify(err));
                process.exit(1);
            }

            // Log only safe insertion metadata.
            console.log("users.insertMany");
            console.log(JSON.stringify({
                insertedCount: data.insertedCount,
                insertedIds: data.insertedIds
            }));

            data.ops.forEach((user) => {
                const stocks = Math.floor((Math.random() * 40) + 1);
                const funds = Math.floor((Math.random() * 40) + 1);

                finalAllocations.push({
                    userId: user._id,
                    stocks: stocks,
                    funds: funds,
                    bonds: 100 - (stocks + funds)
                });
            });

            console.log("Allocations to insert:");
            finalAllocations.forEach((allocation) => {
                console.log(JSON.stringify(allocation));
            });

            allocationsCol.insertMany(finalAllocations, (err, data) => {
                parseResponse(err, data, "allocations.insertMany");

                console.log("Database reset performed successfully");
                process.exit(0);
            });
        });
    });
});
