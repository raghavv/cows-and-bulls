// const { pathsToModuleNameMapper } = require('ts-jest/utils');
// const { compilerOptions } = require('./tsconfig');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/*test.ts'
  ],

  // moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths , { prefix: 'src/' } )
};