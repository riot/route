module.exports = function(config) {

  const customLaunchers = process.env.BROWSERSTACK ? require('./browsers') : {
    ChromeHeadlessNoSandbox: {
      base: 'ChromeHeadless',
      flags: ['--no-sandbox'],
    }
  }

  const browsers = Object.keys(customLaunchers)

  if (process.env.BROWSERSTACK) {
    browsers.forEach(function(browser) { customLaunchers[browser].base = 'BrowserStack' })
  }

  config.set({
    basePath: '',
    frameworks: ['mocha', 'riot'],
    files: [
      '../node_modules/expect.js/index.js',
     /* '../node_modules/riot/riot.js',
      '../dist/route+tag.js',*/
      //'tags/*.tag',
      'specs/core.specs.js',
      //'specs/tag.specs.js'
    ],
    browsers: browsers,
    customLaunchers: customLaunchers,
    reporters: ['mocha', 'coverage'],
    preprocessors: {
      //'tags/*.tag': ['riot'],
      /*'../dist/route-tag.js': ['coverage']*/
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
