"use strict";

const path = require("path");

const finalEnv = process.env.NODE_ENV || "development";

const allConf = require(
    path.resolve(__dirname + "/../config/env/all.js")
);

const envConf = require(
    path.resolve(
        __dirname +
        "/../config/env/" +
        finalEnv.toLowerCase() +
        ".js"
    )
) || {};

const config = { ...allConf, ...envConf };

// Never print secret values or the complete configuration object.
console.log("Current Config:");
console.log({
    environment: finalEnv,
    port: config.port,
    hostName: config.hostName,
    databaseConfigured: Boolean(config.db),
    cookieSecretConfigured: Boolean(config.cookieSecret),
    cryptoKeyConfigured: Boolean(config.cryptoKey),
    zapApiKeyConfigured: Boolean(config.zapApiKey)
});

module.exports = config;
