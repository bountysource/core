/* jshint -W117 */
'use strict';

describe("TrackerShow Controller -- ", function() {
  var tracker_ctrl;
  var api;
  var scope;
  var routeparams;
  var httpBackend;

  var HELPERS = {
    promise_with_data: function (mock_data) {
      return { then: function (fn) {return fn(mock_data);} };
    },
    promise_without_data: {
      then: function(handler) {return handler();}
    }
  };
  var mock_issue_1 = {};
  var mock_issue_2 = {};
  var mock_tracker = {
    issues_valuable: [mock_issue_1, mock_issue_2],
    issues_popular: [],
    issues_newest: [],
    followed: true
  };
  var mock_route_param = {id:5};
  // promise returns a callback fn that responds to 
  // Initialize the controller and a mock scope
  beforeEach(module('app'));

  beforeEach(inject(function ($controller, $rootScope, $routeParams, $api, $httpBackend) {
    scope = $rootScope.$new();

    api = $api;


    spyOn(api, 'tracker_get').andReturn(HELPERS.promise_with_data(mock_tracker));
    spyOn(api, 'tracker_unfollow').andReturn(HELPERS.promise_without_data);
    spyOn(api, 'tracker_follow').andReturn(HELPERS.promise_without_data);

    routeparams = $routeParams;
    routeparams.id = mock_route_param.id;

    httpBackend = $httpBackend;
    httpBackend.whenJSONP('/*/').respond({hello: "something"});

    // only call controller when api mock setup
    tracker_ctrl = $controller('TrackerShow', {$scope: scope, $routeParams: routeparams, $api: api});
  }));
  describe("initial state values", function() {
    it("should get TRACKERS from API", function() {
      expect(api.tracker_get).toHaveBeenCalled();
      expect(api.tracker_get).toHaveBeenCalledWith(mock_route_param.id);
    });
    // console.log(typeof(scope.issue_filter_options));
    // expect(scope.order_col).toBeDefined();
    // expect(scope.issue_filter_options).not().toBeDefined();
  });
});