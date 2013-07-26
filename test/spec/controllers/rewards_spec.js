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
	reply_with: function (mock_return) {
		return {
			then: function (handler) {return handler===undefined ? handler() : handler(mock_return);}
		};
	}
};
describe("RewardsController --", function() {
//////////////////////////////
////////// SETUP /////////////
//////////////////////////////
	var scope;
	var api;
	var create_spy;
	var update_spy;
	var destroy_spy;
	var rewards_ctrl;

	beforeEach(module('app'));

	beforeEach(inject(function ($controller, $rootScope, $routeParams, $api) {
		scope = $rootScope.$new();
		api = $api;
		create_spy = spyOn(api, 'reward_create').andReturn(PROMISE.reply_with(MOCKS.RESPONSE));
		update_spy = spyOn(api, 'reward_update').andReturn(PROMISE.reply_with(MOCKS.RESPONSE));
		destroy_spy = spyOn(api, 'reward_destroy').andReturn(PROMISE.reply_with(MOCKS.RESPONSE));
		rewards_ctrl = $controller('RewardsController', {$scope: scope, $api: api});
	}));
	// This is best I can do for now I think i'll wait for rewards
	describe("INIT scope.fundraiser", function() {
		it("should initialize new reward", function() {
		  expect(scope.new_reward).toBeDefined();
		  expect(scope.new_reward).not.toBeNull();	//assert new_reward is initialized
		});
	});
	describe("Creating a Reward", function() {
		it("should make a call to the api:reward_create", function() {
			scope.create_reward(jasmine.any(Object));
			expect(create_spy).toHaveBeenCalled();
		});
		////////////// FIGURE OUT HOW TO TEST ANONYMOUS FUNCTIONS /////////////////
	});
	describe("Update reward", function() {
		it("should make a call to api", function() {
			scope.update_reward(jasmine.any(Object), jasmine.any(Object));
			expect(update_spy).toHaveBeenCalled();
		});
	});
	describe("Destroy reward", function() {
		it("should make a call to api", function() {
			scope.destroy_reward(jasmine.any(Object), jasmine.any(Object));
			expect(destroy_spy).toHaveBeenCalled();
		});
	});
});

