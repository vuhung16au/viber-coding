module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/components/(.*)$': '<rootDir>/app/components/$1',
    '^@/firebase/(.*)$': '<rootDir>/app/firebase/$1'
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest']
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  clearMocks: true,
  coverageDirectory: "coverage",
};