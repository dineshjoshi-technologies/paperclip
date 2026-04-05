module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/unit/**/*.test.js'],
  transform: {},
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Handle ES modules in node_modules
  transformIgnorePatterns: [
    '/node_modules/(?!(swagger-jsdoc|swagger-ui-express)/)',
  ],
};