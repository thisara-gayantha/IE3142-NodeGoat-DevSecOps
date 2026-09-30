"use strict";

// Default application configuration.
// Sensitive values must be provided through environment variables.

function requireEnv(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

const port = process.env.PORT || 4000;

module.exports = {
    port,
    db: requireEnv("MONGODB_URI"),
    cookieSecret: requireEnv("SESSION_SECRET"),
    cryptoKey: requireEnv("CRYPTO_KEY"),
    cryptoAlgo: "aes256",
    hostName: "localhost",
    environmentalScripts: []
};

