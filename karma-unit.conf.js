// Karma configuration

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // list of files / patterns to load in the browser
    files: [
      'app/components/angular/angular.js',
      'app/components/angular-*/angular-*.js',

      'app/pages/*.js',
      'app/pages/**/*.js',

      'app/common/*.js',
      'app/common/**/*.js',
      'app/common/**/**/*.js',

      'test/unit/**/*.js',
      'test/mock/*.js'
    ],

    // list of files to exclude
    exclude: [
      'app/components/angular-scenario/angular-scenario.js'
    ],

    frameworks: ['jasmine'],

    // test results reporter to use
    // possible values: dots || progress || growl
    reporters: ['dots'],

    // web server port
    port: 8080,

    // cli runner port
    runnerPort: 9100,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 5000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,

//    // All things code coverage related
//    preprocessors: {
//      "**/app/pages/**/*.js": "coverage"
//    },
//
//    coverageReporter: {
//      type: "lcov",
//      dir: "coverage/"
//    },

    plugins: [
      'karma-coverage',
      'karma-jasmine',
      'karma-phantomjs-launcher'
    ]
  });
};
