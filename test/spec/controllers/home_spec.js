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
			description: jasmine.any(String)
		}
	},
	MODELS: {
		bounty_claim: {
			donations: jasmine.any(Array),
			donation_total: jasmine.any(Number),
			your_cut: jasmine.any(Number)
		},
		donation: {
			amount: jasmine.any(Number)
		},
		issue: {
			id: jasmine.any(String),
			bounty_total: jasmine.any(Number),
			bounties: jasmine.any(Array),
			solutions: jasmine.any(Array),
			my_solution: jasmine.any(Object)
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

describe("HomeCtrl --", function() {
//////////////////////////////
////////// SETUP /////////////
//////////////////////////////
	var scope;
	var api;
	var home_ctrl;

	var mock_trackers;
	var project_cards_spy;
	var people_interesting_spy;
	var fundraiser_cards_spy;

	beforeEach(module('app'));

	beforeEach(inject(function ($rootScope, $controller, $api) {
		scope = $rootScope.$new();

		api = $api;
		fundraiser_cards_spy	= spyOn(api,'fundraiser_cards').andReturn(MOCKS.RESPONSE);
		people_interesting_spy	= spyOn(api,'people_interesting').andReturn(PROMISE.reply_with(MOCKS.RESPONSE));

		mock_trackers = [
			{bounty_total:"0"},
			{bounty_total:"1"},
			{bounty_total:"2"},
			{bounty_total:"3"}
		];
		project_cards_spy		= spyOn(api,'project_cards').andReturn(PROMISE.reply_with(mock_trackers));

		home_ctrl = $controller('HomeCtrl', {
			$scope: scope,
			$api: api
		});
	}));

	it("should find the home_ctrl", function() {
		expect(home_ctrl).not.toBeNull();
		expect(home_ctrl).toBeDefined();
	});

	describe("API calls", function() {
		it("should call fundraiser_cards", function() {
			expect(project_cards_spy).toHaveBeenCalled();
		});
		it("should call people_interesting", function() {
			expect(people_interesting_spy).toHaveBeenCalled();
		});
		it("should call project_cards", function() {
			expect(fundraiser_cards_spy).toHaveBeenCalled();
		});
	});

	describe("HANDLERS", function() {
		it("should instantiate scope fundraiser", function() {
			expect(scope.fundraisers).toEqual(MOCKS.RESPONSE);
		});
		it("should instantiate scope people", function() {
			expect(scope.people).toEqual(MOCKS.RESPONSE);
		});
		describe("trackers", function() {
			it("should instantiate scope[trackers]", function() {
			  expect(scope.trackers).toEqual(mock_trackers);
			});
			it("should coerce scopes[trackers].bounty_total to ints", function() {
				var t = scope.trackers;
				expect(t[0].bounty_total).toEqual(0);
				expect(t[1].bounty_total).toEqual(1);
				expect(t[2].bounty_total).toEqual(2);
				expect(t[3].bounty_total).toEqual(3);
			});
		});
	});
});