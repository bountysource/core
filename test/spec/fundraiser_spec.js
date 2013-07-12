/* jshint -W117 */
'use strict';

describe("FundraiserEdit Controller --", function() {
//////////////////////////////
////////// SETUP /////////////
//////////////////////////////
  //reply_with takes in mock data and returns an
  // OBJECT  that has a then attr is a
  // FUNCTION that takes in a handler that will have any number of args

  var PROMISE = {
    reply_with: function (mock_return) {
      return { then: function (handler) {return handler===undefined ? handler() : handler(mock_return);} };
    }
  };

  function get_new_object(mock) {
    var new_obj = {};
    for(var key in mock){ new_obj[key] = mock[key]; }
    return new_obj;
  }

  var MOCKS = {
    fundraiser: {
      rewards: jasmine.any(Array);
    }
    tracker: {
      issues_valuable: jasmine.any(Array),
      issues_popular: jasmine.any(Array),
      issues_newest:  jasmine.any(Array),
      followed: true
    },
    route_param: {
      id:jasmine.any(Number)
    },
    tag: {
      name: null
    }
  };
  /////////////////////////////////////
  /////////////// TESTS  //////////////
  /////////////////////////////////////
  var fund_ctrl;
  var api;
  var scope;
  var routeparams;git

  beforeEach(module('app'));

  beforeEach(inject(function ($controller, $rootScope, $routeParams, $api, $location) {
    scope = $rootScope.$new();
    api = $api;
    routeparams = $routeParams;
    spyOn(api, 'fundraiser_get').andReturn(PROMISE.reply_with(jasmine.any(Object)));
    fund_ctrl = $controller('FundraiserEditController', {$scope: scope, $routeParams: routeparams, $api: api});
  }));
  describe("", function() {
    var scope_fundraiser = {
      title: jasmine.any(String),
      short_description: jasmine.any(String),
      description: jasmine.any(String),
    }

  });  

});