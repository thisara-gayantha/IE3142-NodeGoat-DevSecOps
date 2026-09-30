// ***********************************************************
// Cypress plugin configuration
// ***********************************************************

const { port, hostName } = require("../../../config/env/all");

module.exports = (on, config) => {
  "use strict";

  config.baseUrl = `http://${hostName}:${port}`;

  const requiredSecrets = [
    "NODEGOAT_ADMIN_PASSWORD",
    "NODEGOAT_USER1_PASSWORD"
  ];

  requiredSecrets.forEach(name => {
    if (!process.env[name]) {
      throw new Error(
        `Missing required environment variable: ${name}`
      );
    }

    config.env[name] = process.env[name];
  });

  return config;
};
