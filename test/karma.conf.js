module.exports = function(config) {

  var browsers,
    customLaunchers = []

  if (process.env.BROWSERSTACK) {
    customLaunchers = require('./browsers')
    browsers = Object.keys(customLaunchers)
    browsers.forEach(function(browser) { customLaunchers[browser].base = 'BrowserStack' })
  } else
    browsers = ['PhantomJS']

  config.set({
    basePath: '',
    frameworks: ['mocha'],
    plugins: [
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-coverage',
      'karma-browserstack-launcher',
      'karma-phantomjs-launcher'
    ],
    files: [
      '../node_modules/expect.js/index.js',
      'polyfill.js',
      '../dist/route.js',
      'specs/core.specs.js'
    ],
    browsers: browsers,
    customLaunchers: customLaunchers,
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
