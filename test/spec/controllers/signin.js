/* jshint -W117 */
'use strict';

describe('Controller: Signin', function () {

  // load the controller's module
  beforeEach(module('app'));

  var Signin,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    Signin = $controller('Signin', {
      $scope: scope
    });
  }));

  it('should do something super sipmle', function () {
    expect(scope.github_signin_url).toBe('https://api.bountysource.com/auth/github?redirect_url=http%3A%2F%2Flocalhost%3A9000%2F');
  });
});
