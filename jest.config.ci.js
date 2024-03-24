const defaultConfig = require('./jest.config.js');

export default Object.assign({}, defaultConfig, {
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{ts,tsx}', '!**/node_modules/**', '!**/*.d.ts', '!jest.*'
  ],
});
