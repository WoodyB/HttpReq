import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  testEnvironment: 'node',
  testMatch: ['**/tests/acceptance-tests/**/*.test.js'],
  collectCoverage: false,
  coverageDirectory: 'coverage/acceptance-js',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.d.ts',
  ],
  // Acceptance tests require longer timeout for network operations
  testTimeout: 30000,
  verbose: true,
  transform: {},
  moduleFileExtensions: ['js', 'json'],
};

export default config;
