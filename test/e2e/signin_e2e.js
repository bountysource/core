/*jshint -W117 */

'use strict';
var fill_form =  function(data) {
	for(var key in data) {
		var id = 'form_data.' + key;
		input(id).enter(data[key]);
	}
};
describe('Scenario: Signining In --', function() {
	var MOCK = {
		signed_in_user : {
			email: "dandan@gmail.com",
			password: "dandan123456"
		}
	};
	var new_user_valid = {email: "mrmanly@gmail.com", password: "MANLINESS123456", first_name: "Mister", last_name: "ManlyMan", display_name: "TheManliest", terms: true };
	// MOCK.signed_in_user = signed_in_user;
	MOCK.new_user_valid = new_user_valid;

  beforeEach(function () {
    browser().navigateTo("/signin");
  });
  /////////////////////////////////////////////////////////////////
  //////////////////////// EXAMPLE TEST ///////////////////////////
  /////////////////////////////////////////////////////////////////
  // it('should auto compile', function () {
		// expect(element('h2').text()).toBe('Please sign in to continue');
  // });
	/////////////////////////////////////////////////////////////////

  describe('INITIAL STATE', function () {
		it("EMAIL field should be initialized to example email", function() {
			expect(element('#inputEmail').attr('placeholder')).toBe('john@doe.com');
		});
		it("PASSWORD field should be initialized to example password", function() {
			expect(element('#inputPassword').attr('placeholder')).toBe('abcd1234');
		});
		describe('HIDDEN values', function() {
			it('should have FIRST NAME hidden', function() {
				expect(element('input:visible')).not().toBeNull();
			});
		});
	});
	describe("INITIAL SUBMISSION", function() {
	  it("should allow you to SIGIN_IN", function() {
			input('form_data.email').enter(MOCK.new_user_valid.email);
	    input('form_data.password').enter('aa123');
		  element("button:contains('Sign In')").click();
	    expect(element(".help-inline:visible").text()).toBe("Available!");
	  });
	  it("should ERROR for incorrectly formatted PASSWORD", function() {
	    // input('form_data.email').enter(MOCK.new_user_valid.email);
	    input('form_data.password').enter('aaaaaaaaaaaaaaaaaaaaa');
	    element("button:contains('Sign In')").click();
	    input('form_data.first_name').enter(MOCK.new_user_valid.first_name);
	    input('form_data.last_name').enter(MOCK.new_user_valid.last_name);
	    input('form_data.display_name').enter(MOCK.new_user_valid.last_name);
	    input('form_data.terms').check();
	    element("button:contains('Sign Up')").click();
	    // console.log(element('.alert.alert-error').text());
	    expect(element('.alert.alert-error').text()).toContain('Password must contain a letter and a number');
	  });

	  it("should ERROR for incorrectly formatted PASSWORD", function() {
	    // input('form_data.email').enter(MOCK.new_user_valid.email);
	    // input('form_data.password').enter('aa123');
	    fill_form(MOCK.signed_in_user);
	    element("button:contains('Sign In')").click();
	    input('form_data.first_name').enter(MOCK.new_user_valid.first_name);
	    input('form_data.last_name').enter(MOCK.new_user_valid.last_name);
	    input('form_data.display_name').enter(MOCK.new_user_valid.last_name);
	    input('form_data.terms').check();
	    element("button:contains('Sign Up')").click();
	    expect(element('.alert.alert-error').text()).toContain('Password is too short (minimum is 8 characters)');
	  });
	});
});
