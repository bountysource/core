// Karma E2E configuration

// base path, that will be used to resolve files and exclude
basePath = '';

// list of files / patterns to load in the browser
files = [
  ANGULAR_SCENARIO,
  ANGULAR_SCENARIO_ADAPTER,
  'test/e2e/api-test.js',
  'test/e2e/mock.js',
  'test/e2e/helper.js',
  'test/e2e/signin_e2e.js',
  'test/e2e/fundraiser_create_e2e.js',
  'test/e2e/bounty_create_e2e.js'
];
frameworks = ["ng-scenario"];

// list of files to exclude
exclude = [];

// test results reporter to use
// possible values: dots || progress || growl
reporters = ['dots'];

// web server port
port = 8081;

// cli runner port
runnerPort = 9101;

// enable / disable colors in the output (reporters and logs)
colors = true;

// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;

// enable / disable watching file and executing tests whenever any file changes
autoWatch = false;

proxies = {
  '/': 'http://localhost:9001/'
};

urlRoot = "/_karma_/";

// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)

//browsers = ['Firefox', 'Safari', 'Chrome'];
browsers = ['Chrome'];

// If browser does not capture in given timeout [ms], kill it
captureTimeout = 5000;

// Continuous Integration mode
singleRun = true;
// if true, it capture browsers, run tests and exit
