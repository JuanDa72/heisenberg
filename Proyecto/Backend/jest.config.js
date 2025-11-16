// jest.config.js

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest', 
  
  testEnvironment: 'node', 
  
  testMatch: [
    "<rootDir>/src/**/*.test.ts", 
    "<rootDir>/src/**/*.spec.ts"
  ],
};