'use strict';

describe('Controller: FundraiserCtrl', function () {

  // load the controller's module
  beforeEach(module('bountysourceApp'));

  var FundraiserCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FundraiserCtrl = $controller('FundraiserCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
