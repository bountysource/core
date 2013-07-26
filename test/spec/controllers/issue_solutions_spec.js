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

describe("IssueSolutionsController --", function() {
//////////////////////////////
////////// SETUP /////////////
//////////////////////////////
	var scope;
	var api;
	var routeParams;
	var soln_ctrl;

	var issue_get_spy;

	var soln_update_spy;
	var soln_submit_spy;
	var soln_payout_spy;

	var dispute_get_spy;
	var dispute_resolve_spy;
	var dispute_create_spy;

	beforeEach(module('app'));

	beforeEach(inject(function ($rootScope, $controller, $routeParams, $location, $api) {
		scope = $rootScope.$new();
		api = $api;
		routeParams = $routeParams;
		routeParams.id = "something-47";

		issue_get_spy = spyOn(api, "issue_get").andReturn(PROMISE.reply_with(MOCKS.RESPONSE));			// issue spy

		soln_update_spy = spyOn(api, "solution_update");	// solution spies
		soln_submit_spy = spyOn(api, "solution_submit").andReturn(PROMISE.reply_with(MOCKS.RESPONSE));	// issue spy;
		soln_payout_spy = spyOn(api, "solution_payout");

		dispute_get_spy = spyOn(api, "disputes_get");		// dispute spies
		dispute_resolve_spy = spyOn(api, "dispute_resolve");
		dispute_create_spy = spyOn(api, "dispute_create");

		soln_ctrl = $controller('IssueSolutionsController', {
			$scope: scope,
			$routeParams: routeParams,
			$location: location,
			$api: api
		});
	}));

	describe("INIT", function() {
		it("should fetch issue through api", function() {
			expect(issue_get_spy).toHaveBeenCalled();
			expect(issue_get_spy).toHaveBeenCalledWith(routeParams.id);
		});

		describe("external function calls from response handler", function() {
			var issue_spy;
			var init_bounty_claim_spy;
			var init_solutions_spy;
			var locate_my_solution_spy;
			var locate_my_bounty_spy;

			beforeEach(function() {
				issue_spy = jasmine.createSpyObj('ISSUE', ['id', 'bounty_total']);	//setup

				init_bounty_claim_spy = spyOn(scope, '$init_bounty_claim');
				init_solutions_spy = spyOn(scope, '$init_solutions');
				locate_my_solution_spy = spyOn(scope, '$locate_my_solution');
				locate_my_bounty_spy = spyOn(scope, 'locate_my_bounty');

				scope.issue_response_handler(issue_spy);		//CALL
			});
			it("should call init_bounty_claim", function() {
				expect(init_bounty_claim_spy).toHaveBeenCalledWith(issue_spy);
			});
			it("should call to init_solutions", function() {
				expect(init_solutions_spy).toHaveBeenCalledWith(issue_spy);
			});
			it("should call to init_my_location", function() {
				expect(locate_my_solution_spy).toHaveBeenCalledWith(issue_spy);
			});
			it("should call to locate_my_bounty", function() {
				expect(locate_my_bounty_spy).toHaveBeenCalledWith(issue_spy);
			});
		}); //external fn call

		describe("initializing bounty_claim", function() {
			// keep general for now just check if bounty_claim has been altered
			it("should change the values of bounty_claim object", function() {
				var issue_spy = jasmine.createSpyObj('ISSUE', ['id', 'bounty_total']);	//setup
				var bc_prev = scope.bounty_claim;
				scope.$init_bounty_claim(issue_spy);
				var bc_next = scope.bounty_claim;
				expect(bc_next).not.toEqual(bc_prev);
			});
			it("should set scopes bounty_total from issue response", function() {
				var issue_spy = jasmine.createSpyObj('ISSUE', ['id', 'bounty_total']);	//setup
				var bc_prev = scope.bounty_claim;
				expect(issue_spy.bounty_total).not.toEqual(bc_prev.bounty_total);
				scope.$init_bounty_claim(issue_spy);
				var bc_next = scope.bounty_claim;
				expect(issue_spy.bounty_total).toEqual(bc_next.bounty_total);
			});
			describe("update_bounty_claim", function() {
				it("should have an update function", function() {
					expect(scope.update_bounty_claim).toBeDefined();
				});
				xit("should bounty_claim variables", function() {
					var mock_donations = {
						eff: { amount: NaN, $show_info: jasmine.any(Boolean) },
						fsf: { amount: NaN, $show_info: jasmine.any(Boolean) },
						spi: { amount: NaN, $show_info: jasmine.any(Boolean) },
						dwb: { amount: NaN, $show_info: jasmine.any(Boolean) }
					};
					scope.bounty_claim.donations = mock_donations;
					scope.bounty_claim.bounty_total = jasmine.any(Number);
					scope.update_bounty_claim();
					var actual_total = scope.bounty_claim.donation_total;
					var expected_total = 0;
					expect(actual_total).toEqual(expected_total);
				});
			});

		}); //initializing
	});	//INIT

});

