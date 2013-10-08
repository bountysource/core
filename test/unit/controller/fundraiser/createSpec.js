'use strict';

describe('FundraiserCreateController', function() {
  beforeEach(module('app', 'mockedTeams'));

  var $httpBackend, $rootScope, createController, $location;

  beforeEach(inject(function($injector, defaultJSON, $http) {
    $location = $injector.get('$location');
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.expect('GET', 'https://staging-api.bountysource.com/people/4/teams?callback=CORS&per_page=250').respond( function() { return [200, "CORS(" + JSON.stringify(defaultJSON) + ")"];} );

    $rootScope = $injector.get('$rootScope');

    var $controller = $injector.get('$controller');

    createController = function() {
      return $controller('FundraiserCreateController', {'$scope': $rootScope});
    };

    $rootScope.current_person = {id: 4};
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('has initial fundraiser defined in the scope', function() {
    var controller = createController();
    var tempFund =  {
      funding_goal: 25000,
      description: '',
      short_description: '',
      team_id: null
    };
    $httpBackend.flush();
    expect($rootScope.fundraiser).toEqual(tempFund);
  });

  it('can handle setting location on successful create', function() {
    var controller = createController();
    $httpBackend.flush();

  });

  it('sets error scope if the request was not successful', function() {
    var controller = createController();
    $httpBackend.flush();

  });
});
