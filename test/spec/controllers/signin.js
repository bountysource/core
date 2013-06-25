/* jshint -W117 */
'use strict';

describe('Controller: Signin', function () {

  // load the controller's module
  beforeEach(module('app'));

  var Signin,
    api,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $api) {
    scope = $rootScope.$new();
    api = $api;
    Signin = $controller('Signin', {
      $scope: scope
    });
  }));

  it('should do something super sipmle', function () {
    expect(api.signin_url_for('github')).toBe('https://api.bountysource.com/auth/github?redirect_url=http%3A%2F%2Flocalhost%3A9000%2Fsignin%2Fcallback%3Fprovider%3Dgithub');
  });
});
