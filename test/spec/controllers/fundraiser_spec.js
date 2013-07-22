/* jshint -W117 */
'use strict';
var MOCKS = {
	SCOPE: {
		new_user: {
			email: jasmine.any(String),
			password: jasmine.any(String),
			first_name: jasmine.any(String),
			last_name: jasmine.any(String),
			display_name: jasmine.any(String),
			terms: jasmine.any(Boolean)
		},
		tracker: {
			issues_valuable: jasmine.any(Array),
			issues_popular: jasmine.any(Array),
			issues_newest:  jasmine.any(Array),
			followed: jasmine.any(Boolean)
		},
		fundraiser: {
			// title: jasmine.any(String),
			funding_goal: jasmine.any(Number),
			total_pledged: jasmine.any(Number),
			pledge_count: jasmine.any(Number),
			funding_percentage: jasmine.any(Number),
			days_remaining: jasmine.any(Number)
		},
		fundraiser_details: {
			title: jasmine.any(String),
			short_description: jasmine.any(String),
			image_url: jasmine.any(String),
			homepage_url: jasmine.any(String),
			repo_url: jasmine.any(String),
			description: jasmine.any(String),
		}
	},
	RESPONSE: {
		meta: {
			success: jasmine.any(Boolean)
		},
		data: {
			slug: jasmine.any(String),
			error: jasmine.any(String)
		}
		// rewards: jasmine.any(Array)
	},
	ROUTEPARAMS: {
		id: jasmine.any(Number)
	}
};
var PROMISE = {
	reply_with: function (mock_return) {return { then: function (handler) {return handler===undefined ? handler() : handler(mock_return);} }; }
};
describe("FundraiserCreate Controller --", function() {
//////////////////////////////
////////// SETUP /////////////
//////////////////////////////
	var fund_create_ctrl;
	var api;
	var scope;
	var routeparams;
	var location;
	var create_fundraiser_spy;

	beforeEach(module('app'));

	beforeEach(inject(function ($controller, $rootScope, $routeParams, $api, $location) {
		scope = $rootScope.$new();
		api = $api;
		create_fundraiser_spy = spyOn(api, 'fundraiser_create').andReturn(PROMISE.reply_with(MOCKS.RESPONSE));
		routeparams = $routeParams;
		location = $location;
		fund_create_ctrl = $controller('FundraiserCreateController', {$scope: scope, $routeParams: routeparams, $location: location, $api: api});
	}));

	describe("INIT scope.fundraiser", function() {
		var f;
		beforeEach(function() {
			f = scope.fundraiser;
		});
		it("should init funding_goal", function() {
		  expect(f.funding_goal).toEqual(25000);
		});
		it("should init total_pledge", function() {
		  expect(f.total_pledged).toEqual(0);
		});
		it("should init pledge_count", function() {
		  expect(f.pledge_count).toEqual(0);
		});
		it("should init funding_percentage", function() {
		  expect(f.funding_percentage).toEqual(0);
		});
		it("should init days_remaining", function() {
		  expect(f.days_remaining).toEqual(30);
		});
	});
	describe("call API:create", function() {
		it("should use scope.fundraiser as parameter", function() {
			angular.copy(MOCKS.SCOPE.fundraiser, scope.fundraiser);
			scope.create();
			expect(api.fundraiser_create).toHaveBeenCalled();
			expect(api.fundraiser_create).toHaveBeenCalledWith(scope.fundraiser, jasmine.any(Function));
		});
		it("should redirect to fundraiser edit page if successful", function() {
			var success_response = angular.copy(MOCKS.RESPONSE);
			success_response.meta.succcess = true;		//Override value of success

			scope.fundraiser = angular.copy(MOCKS.SCOPE.fundraiser);		//copy over values to scope
			create_fundraiser_spy.andReturn(PROMISE.reply_with(success_response));	//override default response
			scope.create();
			expect(scope.error).toBeUndefined();
			// ADD TEST FOR REDIRECT
		});

		it("should redirect to fundraiser edit page if successful", function() {
			var error_response = angular.copy(MOCKS.RESPONSE);
			error_response.meta.succcess = false;		//Override value of success

			scope.fundraiser = angular.copy(MOCKS.SCOPE.fundraiser);		//copy over values to scope
			create_fundraiser_spy.andReturn(PROMISE.reply_with(error_response));	//override default response
			scope.create();
		});
	});
});
describe("FundraiserEditController Controller --", function() {
	var fund_ctrl;
	var api;
	var scope;
	var routeparams;
	var location;
	var update;
	var read;

	beforeEach(module('app'));

	beforeEach(inject(function ($controller, $rootScope, $routeParams, $api, $location) {
		scope = $rootScope.$new();

		api = $api;
		read = spyOn(api, 'fundraiser_get').andReturn(PROMISE.reply_with(MOCKS.SCOPE.fundraiser));
		update = spyOn(api, 'fundraiser_update').andReturn(PROMISE.reply_with(MOCKS.SCOPE.fundraiser));

		routeparams = angular.copy(MOCKS.ROUTEPARAMS);
		routeparams.id = "someguy-5";

		location = $location;
		location.path('/fundraiser/'+routeparams.id+"/edit");		//set url location to expected format

		fund_ctrl = $controller('FundraiserEditController', {$scope: scope, $location: location, $routeParams: routeparams, $api: api});
	}));

	describe("INIT", function() {
		it("should make a fetch to the api", function() {
			expect(api.fundraiser_get).toHaveBeenCalled();
			// expect(scope.master).toEqual(response);
			// expect(scope.changes).toEqual(response);
			// expect(scope.changes).toEqual(scope.master);	//at init there should exist no changes
		});
	});
	describe("CHANGES", function() {
		it("should detect if changes have occured", function() {
			scope.master = { a: { b:null } };
			scope.changes = { a: { b:undefined } };
			var changes_happened = scope.unsaved_changes();
			expect(changes_happened).toBeTruthy();
		});
		it("should detect if changes have NOT occured", function() {
			scope.master = { a: { b:3 } };
			scope.changes = { a: { b:3 } };
			var changes_happened = scope.unsaved_changes();
			expect(changes_happened).toBeFalsy();
		});
	});
	describe("SAVING CHANGES", function() {
		it("should only allow correctly formatted value to submit", function() {
			var f = scope.fundraiser;
			f.image_url = "alskdjflksadjf";
			f.homepage_url = "slajdflasjfd";
		});
		it("should make an api call when SAVE is called:", function() {
			scope.save();
			expect(api.fundraiser_update).toHaveBeenCalled();
		});
		describe("if response has ERROR", function() {
			it("should set scope error if reponse returns an error:", function() {
				var mock_response = {
					error: "an error has occured"
				};
				update.andReturn(PROMISE.reply_with(angular.copy(mock_response)));
				scope.save();
				expect(scope.error).toEqual(mock_response.error);
			});
		});
		describe("if response has NO ERROR", function() {
			beforeEach(function() {
				var mock_response = {
					error: null
				};
				update.andReturn(PROMISE.reply_with(angular.copy(mock_response)));
			});
			it("should redirect to different page", function() {
				var previous_location = location.path();
				scope.master.slug = "anothercompany-47";
				scope.save();
				var next_location = location.path();
				expect(next_location).not.toEqual(previous_location);	//assert that location has changed
			});
			it("should redirect to the SHOW page of fundraiser", function() {
				scope.master.slug = "anothercompany-47";

				scope.save();

				var next_location = location.path();
				var next_expected_location = "/fundraisers/anothercompany-47";
				expect(next_location).toEqual(next_expected_location);	//assert location follows expected REST
			});
		});

	});
	describe("CANCELING ", function() {
		it("should redirect to different page", function() {
			var previous_location = location.path();
			scope.master.slug = "anothercompany-47";
			scope.cancel();
			var next_location = location.path();
			expect(next_location).not.toEqual(previous_location);
		});
		it("should redirect to the SHOW page", function() {
			scope.master.slug = "anothercompany-47";
			scope.cancel();
			var next_location = location.path();
			var next_expected_location = "/fundraisers/anothercompany-47";
			expect(next_location).toEqual(next_expected_location);
		});
	});

});

