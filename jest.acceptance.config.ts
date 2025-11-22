import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/acceptance-tests'],
  testMatch: ['<rootDir>/tests/acceptance-tests/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ],
  coverageDirectory: 'coverage/acceptance',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  verbose: true,
  testTimeout: 30000  // Longer timeout for acceptance tests
};

export default config;
