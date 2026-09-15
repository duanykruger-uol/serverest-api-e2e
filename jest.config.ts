import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  testTimeout: 30000,
  slowTestThreshold: 30,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!@faker-js)'],
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './reports',
        filename: 'report.html',
        openReport: false,
        pageTitle: 'ServeRest API - Report',
        customInfos: [
          { title: 'Projeto', value: 'ServeRest API' },
          { title: 'API', value: 'https://compassuol.serverest.dev' },
        ],
      },
    ],
  ],
};

export default config;
