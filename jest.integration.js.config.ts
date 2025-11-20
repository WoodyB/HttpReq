import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  testEnvironment: 'node',
  testMatch: ['**/tests/integration-tests/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage/integration-js',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.d.ts',
  ],
  // Integration tests require longer timeout for external API calls
  testTimeout: 10000,
  verbose: true,
  transform: {},
  moduleFileExtensions: ['js', 'json'],
};

export default config;
