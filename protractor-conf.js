// An example configuration file.
exports.config = {
  // The address of a running selenium server.
  seleniumAddress: 'http://localhost:4444/wd/hub',

  // Spec patterns are relative to the current working directly when
  // protractor is called.
  specs: [
    'test/integration/fundraisers.js'
  ],

  // ----- Capabilities to be passed to the webdriver instance.
  // For a full list of available capabilities, see
  // https://code.google.com/p/selenium/wiki/DesiredCapabilities
  capabilities: {
    'browserName': 'chrome'
  },

  // A base URL for your application under test. Calls to protractor.get()
  // with relative paths will be prepended with this.
  baseUrl: 'http://localhost:9001',

  // ----- Options to be passed to minijasminenode.
  jasmineNodeOpts: {
    // onComplete will be called before the driver quits.
    onComplete: null,
    isVerbose: false,
    showColors: true,
    includeStackTrace: true
  }
};
