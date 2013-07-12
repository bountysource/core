/* jshint -W117 */
'use strict';

describe("TrackerShow Controller --", function() {
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
    issue_1: {},
    issue_2: {},
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
  var tracker_ctrl;
  var api;
  var scope;
  var routeparams;

  beforeEach(module('app'));

  beforeEach(inject(function ($controller, $rootScope, $routeParams, $api) {
    scope = $rootScope.$new();

    api = $api;
    spyOn(api, 'tracker_get').andReturn(PROMISE.reply_with(MOCKS.tracker));
    spyOn(api, 'tracker_unfollow').andReturn(PROMISE.reply_with());
    spyOn(api, 'tracker_follow').andReturn(PROMISE.reply_with());

    routeparams = $routeParams;
    routeparams.id = MOCKS.route_param.id;

    // only construct controller when api mock setup
    tracker_ctrl = $controller('TrackerShow', {$scope: scope, $routeParams: routeparams, $api: api});
  }));

  describe("INIT:", function() {
    it("should get TRACKERS from API", function() {
      expect(api.tracker_get).toHaveBeenCalled();
      expect(api.tracker_get).toHaveBeenCalledWith(MOCKS.route_param.id);
    });

    describe("Filter Options::", function() {
      it("should initialize issue_filter_options", function() {
        expect(scope.issue_filter_options).toBeDefined();
        expect(scope.issue_filter_options).not.toBeNull();
      });
      describe("Initializing FilterOptionValues:", function() {
        var options;
        beforeEach(function() {
          options = scope.issue_filter_options;
        });
        it("should set 'text'         to null",   function() {expect(options.text).toBeNull();            });
        it("should set 'bounty_min'   to null",   function() {expect(options.bounty_min).toBeNull();      });
        it("should set 'bounty_max'   to null",   function() {expect(options.bounty_max).toBeNull();      });
        it("should set 'only_valuable'to false",  function() {expect(options.only_valuable).toBeFalsy();  });
        it("should set 'hide_closed'  to false",  function() {expect(options.hide_closed).toBeFalsy();    });
        it("should set 'hide_open'    to false",  function() {expect(options.hide_open).toBeFalsy();      });
      });
    });

    it("should set 'order_reverse' to true",        function() {expect(scope.order_reverse).toBeTruthy();         });
    it("should set 'order_col' to 'bounty_total'",  function() {expect(scope.order_col).toEqual("bounty_total");  });

    xdescribe("Ctrl Locals::", function() {
      it("should set 'new_tag'", function() {
        expect(tracker_ctrl.tracker).toBeDefined();
      });
    });

  });
  xdescribe("AFTER tracker recieved", function() {
    it("should respond when NOT Following", function() {
      var unfollowed_tracker = get_new_object(mock_tracker);
      expect(unfollowed_tracker).not.toBeNull();
    });
  });
});