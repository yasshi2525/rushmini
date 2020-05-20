const { defaults: tsPreset } = require("ts-jest/presets");

module.exports = {
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/spec/tsconfig.json",
    },
  },
  modulePaths: ["<rootDir>/src"],
  setupFiles: [],
  testEnvironment: "./test-environment.js",
  testMatch: ["**/e2e/**/*[sS]pec.ts"],
  transform: {
    ...tsPreset.transform,
  },
};
