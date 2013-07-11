/* jshint -W117 */
'use strict';

describe("TrackerShow Controller --", function() {
	//////////////////////////////
	////////// SETUP /////////////
	//////////////////////////////

	var PROMISE = {
		reply_with: function (mock_return) {
			return { then: function (handler) {return handler===undefined ? handler() : handler(mock_return);} };
		}
	};

	var MOCKS = {
		tracker: {
		  issues_valuable: jasmine.any(Array),
		  issues_popular: jasmine.any(Array),
		  issues_newest:  jasmine.any(Array),
		  followed: true
		},
		routeParams: {
		  amount: 0,
		  anonymous: null,
		  payment_mehtod: null
		},
		response: {
			data: {
				id: jasmine.any(Number)
			}
		}
	};
	/////////////////////////////////////
	/////////////// TESTS  //////////////
	/////////////////////////////////////
	var issue_ctrl;
	var api;
	var scope;
	var routeParams;
	var payment;
	var location;
	var window;

	beforeEach(module('app'));

	beforeEach(inject(function ($controller, $rootScope, $routeParams, $api, $payment, $window, $location) {
		scope = $rootScope.$new();

		api = $api;
		spyOn(api, 'issue_get').andReturn(MOCKS.response);	//just return the data ##### NO PROMISE FOR THIS CALL
		spyOn(api, 'set_post_auth_url').andReturn(PROMISE.reply_with());

		routeParams = $routeParams;
		routeParams = MOCKS.routeParams;

		payment = $payment;

		window = $window;

		location = $location;

		// only construct controller when api mock setup
		issue_ctrl = $controller('IssueShow', {$scope: scope, $routeParams: routeParams, $api: api, $payment: payment});
	}));

	describe("INIT:", function() {
		describe("bounty:", function() {
		  it("should initialize bounty", function() {expect(scope.bounty).toBeDefined(); });
		  it("should Default for 'amount' ", function() {expect(scope.bounty.amount).toEqual(0); });
		  it("should Default for 'anonymous'", function() {expect(scope.bounty.anonymous).toBeFalsy(); });

		  xit("initialize for 'anonymous'", inject(function($scope, $routeParams, $controller) {
			  // var scope;
			  var routeParams;
			  // scope = $rootScope.$new();
			  routeParams = MOCKS.routeParams;
			  routeParams.anonymous = true;
				issue_ctrl = $controller('IssueShow', {$scope: scope, $routeParams: routeParams});
				expect(scope.bounty.anonymous).toBeTruthy();
			}));

		});
		// issue is an object that gets returned from api
		it("should make an 'issue_get' call to API", function() {
		  expect(api.issue_get).toHaveBeenCalled();
		  expect(api.issue_get).toHaveBeenCalledWith(routeParams.id, jasmine.any(Function));
		});
		it("should assign response Issue to issue in scope", function() {
			expect(scope.issue).toEqual(MOCKS.response);
		});

		// cant mock out too much interdependency can;t access inner function
		xit("should have a create_payment function", function() {
			var issue_id = jasmine.any(Number);
			scope.issue(issue_id, jasmine.any(Function));
		  expect(scope.create_payment).toBeDefined();
		});
	});
});