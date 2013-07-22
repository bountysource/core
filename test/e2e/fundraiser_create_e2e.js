/*jshint -W117 */

'use strict';
// NEW APPROACH DO WORK OF END TO END TEST USING AS MUCH AS POSSIBLE
// WITHOUT SAVING STATE I.E. RELYING ON COOKIES OR API CALLS
// BASICALLY PURELY HTML MARKUP TESTING.

describe('Scenario: Signining In --', function() {
	// var correct = {};
	// correct['fundraiser-title']				= "A Good Title";
	// correct['funding-goal']						= "Here is a description thats ok";
	// correct['image-url']							= 10000;
	// correct['repo-url']								= 10000;
	// correct['homepage-url']						= "https://www.google.com/123";
	// correct['fundraiser-description']	= "https://github.com/bountysource/frontend";
	// correct['fundraiser-shortdes']		= "Another acceptable descriptions";

	// function fill_fundraiser_form(data) {
	// 	var toinput =	(data===undefined) ? angular.copy(correct) : angular.copy(data);
	// 	for(var key in toinput) {element("#"+key).enter(data[key]); }
	// }
	beforeEach(function () {
		browser().navigateTo("/fundraisers/new");
	});
	function id_exists(id) {
		return expect(element("#" + id).count()).toEqual(1);
	}
	// First test you can find all the required elements on the page
	describe('Fundraiser Input IDs exist', function () {
		it("should have an element title",						function(){id_exists('fundraiser-title'); });
		it("should have an element for funding goal",	function(){id_exists("funding-goal"); });
		it("should have an element for repo url",			function(){id_exists("repo-url"); });
		it("should have an element for homepage url",	function(){id_exists("homepage-url"); });
		it("should have an element for image url",		function(){id_exists("image-url"); });
		it("should have an element for description",	function(){id_exists("fundraiser-shortdes"); });
		it("should have a Button to submit",					function(){id_exists("create-fundraiser-submit"); });
	});
});