'use strict';

describe('Controller: PersonCtrl', function () {

  // load the controller's module
  beforeEach(module('bountysourceApp'));

  var PersonCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PersonCtrl = $controller('PersonCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
