import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/acceptance-tests'],
  testMatch: ['<rootDir>/tests/acceptance-tests/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'ts-jest'
  },
  collectCoverage: false,
  coverageDirectory: 'coverage/acceptance-js',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.d.ts',
  ],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  // Acceptance tests require longer timeout for network operations
  testTimeout: 30000,
  verbose: true,
  // Override module resolution to test the JavaScript version
  moduleNameMapper: {
    '^../../src/HttpReq$': '<rootDir>/src/HttpReq.js'
  },
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
};

export default config;
