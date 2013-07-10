/* jshint -W117 */
'use strict';

describe("TrackerShow Controller -- ", function() {
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
  // this.addMatchers({
  //   toBeLessThan: function(expected) {
  //     var actual = this.actual;
  //     var notText = this.isNot ? " not" : "";

  //     this.message = function () {
  //       return "Expected " + actual + notText + " to be less than " + expected;
  //     }
  //     return actual < expected;
  //   }
  // });

  var mock_issue_1 = {};
  var mock_issue_2 = {};
  var mock_tracker = {
    issues_valuable: [mock_issue_1, mock_issue_2],
    issues_popular: [mock_issue_1],
    issues_newest: [mock_issue_2],
    followed: true
  };
  var mock_route_param = {id:5};
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  var tracker_ctrl;
  var api;
  var scope;
  var routeparams;
  var httpBackend;
  // promise returns a callback fn that responds to 
  // Initialize the controller and a mock scope
  beforeEach(module('app'));

  beforeEach(inject(function ($controller, $rootScope, $routeParams, $api, $httpBackend) {
    scope = $rootScope.$new();

    api = $api;

    spyOn(api, 'tracker_get').andReturn(PROMISE.reply_with(mock_tracker));
    spyOn(api, 'tracker_unfollow').andReturn(PROMISE.reply_with());
    spyOn(api, 'tracker_follow').andReturn(PROMISE.reply_with());

    routeparams = $routeParams;
    routeparams.id = mock_route_param.id;

    httpBackend = $httpBackend;
    // httpBackend.whenJSONP('/*/').respond({hello: "something"});

    // only call controller when api mock setup
    tracker_ctrl = $controller('TrackerShow', {$scope: scope, $routeParams: routeparams, $api: api});
  }));
  describe("initial state values", function() {
    it("should get TRACKERS from API", function() {
      expect(api.tracker_get).toHaveBeenCalled();
      expect(api.tracker_get).toHaveBeenCalledWith(mock_route_param.id);
    });

    describe("filter options", function() {
      it("should initialize issue_filter_options", function() {
        expect(scope.issue_filter_options).toBeDefined();
        expect(scope.issue_filter_options).not.toBeNull();
      });
      it("should SET initial option Values", function() {
        var options = scope.issue_filter_options;
        expect(options.text).toBeNull();
        expect(options.bounty_min).toBeNull();
        expect(options.only_valuable).toBeFalsy();
        expect(options.show_closed).toBeTruthy();
      });
    });

    it("should be in reverse order", function() {
      expect(scope.order_reverse).toBeTruthy();
    });
    it("should be ordered by Bounty Total", function() {
      expect(scope.order_col).toEqual("bounty_total");
    });

  });
  describe("AFTER tracker recieved", function() {
    var unfollowed_tracker = get_new_object(mock_tracker);
    unfollowed_tracker.followed = 
  });
});