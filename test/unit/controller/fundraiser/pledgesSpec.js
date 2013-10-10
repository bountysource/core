'use strict';

describe ('FundraiserLeaderboardController', function() {
  beforeEach(module('app'));

  var $httpBackend, $rootScope, createController, $location;

  beforeEach(inject(function($injector, $http) {
    $location = $injector.get('$location');
    $httpBackend = $injector.get('$httpBackend');

    $rootScope = $injector.get('$rootScope');

    var $controller = $injector.get('$controller');

    createController = function() {
      return $controller('FundraiserLeaderboardController', {'$scope': $rootScope});
    };
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectations();
    $httpBackend.verifyNoOutstandingRequests();
  });
});
