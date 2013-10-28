'use strict';

describe('FundraiserEditController', function() {
  beforeEach(module('app', 'mockedTeams', 'mockedFundraiserEdit'));

  var $httpBackend, $rootScope, createController, $location;

  beforeEach(inject(function($injector, defaultJSON, fundraiserJSON, $http) {
    $location = $injector.get('$location');
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'https://staging-api.bountysource.com/people/4/teams?callback=CORS&per_page=250')
    .respond( function() { return [200, "CORS(" + JSON.stringify(defaultJSON) + ")"];} );

    $httpBackend.when('GET', 'https://staging-api.bountysource.com/user/fundraisers/101?callback=CORS&per_page=250')
    .respond( function() { return [200, "CORS(" + JSON.stringify(fundraiserJSON) + ")"];} );

    $rootScope = $injector.get('$rootScope');

    var $controller = $injector.get('$controller');

    var $routeParams = $injector.get('$routeParams');

    createController = function() {
      return $controller('FundraiserEditController', {'$scope': $rootScope});
    };

    // These define params required for the mocked requests urls
    $rootScope.current_person = {id: 4};
    $routeParams.id = 101;
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('', function() {
    var controller = createController();
    $httpBackend.flush();
  });
});
