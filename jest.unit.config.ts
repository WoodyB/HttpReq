import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/unit-tests'],
  testMatch: ['<rootDir>/tests/unit-tests/**/*.test.ts'],
  transform: {
    '^.+\.ts$': 'ts-jest',
    '^.+\.js$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  verbose: true
};

export default config;
