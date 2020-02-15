module.exports = function(config) {
  config.set({
    mutator: 'typescript',
    packageManager: 'npm',
    reporters: ['html', 'clear-text', 'progress'],
    htmlReporter: {
      baseDir: 'output/coverage/stryker'
    },
    testRunner: 'jest',
    transpilers: [],
    coverageAnalysis: 'off',
    tsconfigFile: 'tsconfig.json',
    mutate: [
        'src/**/*.ts',
        '!src/@types/*.ts'
    ],
    thresholds: {
      break: 100
    }
  });
};
