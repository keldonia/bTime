module.exports = function(config) {
  config.set({
    packageManager: 'npm',
    reporters: [
      'clear-text',
      'html',
      'progress'
    ],
    htmlReporter: {
      baseDir: 'coverage/stryker'
    },
    testRunner: 'jest',
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
