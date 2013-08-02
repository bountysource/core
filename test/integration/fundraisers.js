/* jshint -W117 */
'use strict';

var protractor = require('../../node_modules/protractor/lib/protractor.js');
require('../../node_modules/protractor/jasminewd');

var ptor;
var BASE_URL = "http://localhost:9001/";

describe('Fundraisers Create', function() {

  beforeEach(function() {
    ptor = protractor.getInstance();
  });

  it('should require auth to view page', function() {
    ptor.get(BASE_URL + "fundraisers/new");
  });

});