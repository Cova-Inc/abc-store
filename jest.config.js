export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js',
    '**/?(*.)+(_test_|_TEST_).js',
    '**/?(*.)+[Tt]est.js'
  ],
  collectCoverageFrom: [
    'src/app/api/**/*.js',
    '!src/app/api/**/*.test.js',
    '!src/app/api/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testTimeout: 10000,
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  transform: {},
  transformIgnorePatterns: [
    'node_modules/(?!(firebase|firebase-admin)/)'
  ]
}; 