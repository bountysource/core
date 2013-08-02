/* jshint -W117 */
'use strict';

var util = require('util');
var protractor = require('../../node_modules/protractor/lib/protractor.js');
require('../../node_modules/protractor/jasminewd');

var ptor = protractor.getInstance();

describe('Fundraisers', function() {
  describe('Create', function () {
    it('should require auth to view page', function() {
      ptor.get("/fundraisers/new");
      expect(ptor.getCurrentUrl()).not.toMatch(/\/signin$/);

      ptor.sleep(1000);

      console.log(ptor.getCurrentUrl());
    });

//    it("should!", function() {
//      ptor.get("/fundraisers/new");
//
//
//
//      driver.executeScript("return window.Mock").then(function(obj) {
//        console.log(obj);
//      });
//    });
  });
});