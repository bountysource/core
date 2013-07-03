/*jshint -W117 */

'use strict';

describe('SIGN IN', function() {

  beforeEach(function () {
    browser().navigateTo("/signin");
  });

  it('should auto compile', function () {
    expect(element('h2').text()).toBe('Please sign in to continue');
    input('form_data.email').enter('test@test.com');
  });

});