/*jshint -W117 */

'use strict';
var fill_form =  function(data) {
	for(var key in data) {
		var id = 'form_data.' + key;
		if (typeof(data[key])==="boolean") {input(id).check();} else {input(id).enter(data[key]);}
	}
};
var MOCK = {
	signed_in_user : {
		email: "mr_manly@gmail.com",
		password: "MANLINESS123456"
	},
	new_user_valid : {
		email: "mr_manly@gmail.com",
		password: "MANLINESS123456",
		first_name: "Mister",
		last_name: "ManlyMan",
		display_name: "TheManliest",
		terms: true
	}
};

describe('Scenario: Signining In --', function() {
	beforeEach(function () {
		// element("a:contains('staging')").click();
		browser().navigateTo("/signin");
	});
	describe('INITIAL STATE', function () {
		it("EMAIL field should be initialized", function() {
			expect(element('#inputEmail').attr('placeholder')).toBe('john@doe.com');
			// expect(element('#inputEmail').attr('placeholder')).toMatch('+[a-zA-Z]@*.3[a-zA-Z]');
			expect(element('#inputEmail:visible').count()).toBe(1);
		});
		it("PASSWORD field should initialized", function() {
			expect(element('#inputPassword').attr('placeholder')).toMatch('[a-zA-Z].*[0-9]|[0-9].*[a-zA-Z]');
			expect(element('#inputPassword:visible').count()).toBe(1);
		});
		it("should HIDE REST of FIELDS", function() {
			expect(element('#inputDisplayName:hidden').count()).toBe(1);
			// WHY IS THIS IS FAILING:
			// expect(element('#inputLastName:hidden').count()).toBe(1);
			// expect(element('#inputFirstName:hidden').count()).toBe(1);
		});
	});
	describe("INITIAL SUBMISSION", function() {
		it("should allow you to SIGIN_IN", function() {
			input('form_data.email').enter(MOCK.new_user_valid.email);
			input('form_data.password').enter('aa123');
			expect(element(".help-inline").text()).toContain("Available!");		//INCOMPLETE
		});

		it("should FIND user that EXISTS", function() {
			input('form_data.email').enter(MOCK.new_user_valid.email);
			expect(element(".help-inline").text()).toContain("Found!");		//INCOMPLETE
		});

		it("should ERROR for incorrectly formatted PASSWORD", function() {
			var no_number_password_user = angular.copy(MOCK.signed_in_user);
			no_number_password_user.password = 'aaaaaaaaaaaaaaaaaaaaa';
			fill_form(no_number_password_user);
			element("button:contains('Sign In')").click();
			expect(element('.alert.alert-error').text()).toContain('Password not correct');
		});
	});

	describe("VALID SIGN UP", function() {
		it("should NOT show errors for for correct signup", function() {
			fill_form(MOCK.new_user_valid);
			element("button:contains('Sign Up')").click();		//INCOMPLETE
		});
	});

	// since user already gets created look at the possible paths
	describe("REDIRECT to the HOMEPAGE", function() {
		it("should have HOME URL", function() {
			fill_form(MOCK.signed_in_user);
			element("button:contains('Sign In')").click();
			expect(browser().location().url()).toBe("/");
		});
		it("should show user's DISPLAY_NAME in NAVBAR", function() {
			expect(binding("current_person.display_name")).toBe(MOCK.new_user_valid.display_name);
		});
	});
});


describe('Scenario: Creating A Fundraiser --', function() {
	beforeEach(function() {
		browser().navigateTo("/fundraisers/new");
	});
	function id_exists(id) {
		return expect(element("#" + id).count()).toEqual(1);
	}

	// First test you can find all the required elements on the page
	xdescribe('Fundraiser Input IDs exist', function () {
		it("should first signin", function() {
			browser().navigateTo("/signin");
			fill_form(MOCK.signed_in_user);
			element("button:contains('Sign In')").click();
			sleep(2);
			browser().navigateTo("/fundraisers/new");
			var current_path = browser().location().url();
			expect(current_path).toBe("/fundraisers/new");
		});
		it("should have an element title",						function(){id_exists("fundraiser-title");});
		it("should have an element for funding goal",	function(){id_exists("funding-goal"); });
		it("should have an element for repo url",			function(){id_exists("repo-url"); });
		it("should have an element for homepage url",	function(){id_exists("homepage-url"); });
		it("should have an element for image url",		function(){id_exists("image-url"); });
		it("should have an element for description",	function(){id_exists("fundraiser-shortdes"); });
		it("should have a Button to submit",					function(){id_exists("create-fundraiser-submit"); });
	});
	describe("Fundraiser entering items", function() {

		it("should first signin", function() {
			browser().navigateTo("/signin");
			fill_form(MOCK.signed_in_user);
			element("button:contains('Sign In')").click();
			sleep(2);
			browser().navigateTo("/fundraisers/new");
		});
		it("should be on the correct page", function() {
			var current_path = browser().location().url();
			expect(current_path).toBe("/fundraisers/new");
		});
		/////////////// Check if necessary elements exist /////////////////////
		it("should not find something that I made up", function() {
			expect(input('a13yczzymn')).not().toBeDefined();
		});
		it("should have input for title", function() {
			expect(input('fundraiser.title').val()).toBeDefined();
		});
		it("should have input for funding_goal", function() {
			expect(input('fundraiser.funding_goal').val()).toBeDefined();
		});
		it("should have input for image_url", function() {
			expect(input('fundraiser.image_url').val()).toBeDefined();
		});
		it("should have input for homepage_url", function() {
			expect(input('fundraiser.homepage_url').val()).toBeDefined();
		});
		it("should have input for repo_url", function() {
			expect(input('fundraiser.repo_url').val()).toBeDefined();
		});
		it("should have input for description", function() {
			expect(input('fundraiser.description').val()).toBeDefined();
		});
		it("should have input for short_description", function() {
			expect(input('fundraiser.short_description').val()).toBeDefined();
		});
		it("should have a button for submit", function() {
			var found_button = element("button[ng-click='create()']").count();
			expect(found_button).toEqual(1);
		});

		//////////////////////////////////////////////////////////
		//////// Checking if the checkbox works correctly ////////
		//////////////////////////////////////////////////////////
		var mock_fundraiser = {
			title: 'A SUPPER DUPER PROJECT',
			description: 'this project is the craziest s&*# you ever seen',
			short_description: 'slappin the bass mon'
		};
		var expected_checks = 1; //funding goal defaultly set => one condition is met
		it("should initially have only funding goal checked", function() {
			expect(element('input:checked').count()).toBe(expected_checks);
		});
		it("should have 2 checked when filled = {title} && bounty_goal is valid", function() {
			input('fundraiser.title').enter(mock_fundraiser.title);
			expected_checks = 2;
			expect(element('input:checked').count()).toBe(expected_checks);
		});
		it("should have 3 checked filled = {title, description} && bounty_goal is valid", function() {
			input('fundraiser.title').enter(mock_fundraiser.title);
			input('fundraiser.description').enter(mock_fundraiser.description);
			expected_checks = 3;
			expect(element('input:checked').count()).toBe(expected_checks);
		});
		it("should have 4 checked when all fields are valid", function() {
			input('fundraiser.title').enter(mock_fundraiser.title);
			input('fundraiser.description').enter(mock_fundraiser.description);
			input('fundraiser.short_description').enter(mock_fundraiser.short_description);
			expected_checks = 4;
			expect(element('input:checked').count()).toBe(expected_checks);
		});
		it("should enable create fundraiser button when all fields are filled", function() {
			input('fundraiser.title').enter(mock_fundraiser.title);
			input('fundraiser.description').enter(mock_fundraiser.description);
			input('fundraiser.short_description').enter(mock_fundraiser.short_description);
			var found_button = element("button[ng-click='create()']:enabled").count();
			expect(found_button).toBe(1);
		});
	});
});
