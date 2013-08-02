/* jshint -W117 */
'use strict';

var protractor = require('../../node_modules/protractor/lib/protractor.js');
var mock = require('./mock.js');
require('../../node_modules/protractor/jasminewd');

var ptor;

describe('Fundraisers', function() {
  beforeEach(function() {
    ptor = protractor.getInstance();
    Mock.init();
  });

  describe('Create', function () {
    it('should require auth to view page', function() {
      ptor.get("/fundraisers/new");
    });
  });
});