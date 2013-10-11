'use strict';

describe('IssueShow', function() {
  beforeEach(module('app'));

  var $rootScope, $httpBackend, createController, $location;

  beforeEach(inject(function($injector, $http) {
    $rootScope = $injector.get('$rootScope');
    $location = $injector.get('$location');
    $httpBackend = $injector.get('$httpBackend');
    var $controller = $injector.get('$controller');

    createController = function() {
      return $controller('IssueShow', {'$scope': $rootScope});
    };

  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectations();
    $httpBackend.verifyNoOutstandingRequests();
  });
});
