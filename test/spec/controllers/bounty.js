'use strict';

describe('Controller: BountyCtrl', function () {

  // load the controller's module
  beforeEach(module('bountysourceApp'));

  var BountyCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    BountyCtrl = $controller('BountyCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
