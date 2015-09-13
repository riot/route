module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    plugins: [
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-coverage',
      'karma-phantomjs-launcher'
    ],
    files: [
      '../node_modules/expect.js/index.js',
      'polyfill.js',
      '../dist/route.js',
      'specs/core.specs.js'
    ],
    browsers: ['PhantomJS'],
    reporters: ['mocha', 'coverage'],
    preprocessors: {
      '../dist/route.js': ['coverage']
    },
    coverageReporter: {
      dir: '../coverage/',
      reporters: [{
        type: 'lcov',
        subdir: 'report-lcov'
      }]
    },
    singleRun: true
  })
}
