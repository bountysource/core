'use strict';

describe('Controller: TrackerCtrl', function () {

  // load the controller's module
  beforeEach(module('bountysourceApp'));

  var TrackerCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TrackerCtrl = $controller('TrackerCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
