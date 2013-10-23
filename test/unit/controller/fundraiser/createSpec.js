'use strict';

describe('FundraiserCreateController', function() {
  beforeEach(module('app', 'mockedTeams'));

  var $httpBackend, $rootScope, createController, $location;

  beforeEach(inject(function($injector, teamJSON, $http) {
    $location = $injector.get('$location');
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.expect('GET', 'https://staging-api.bountysource.com/people/4/teams?callback=CORS&per_page=250').respond( function() { return [200, "CORS(" + JSON.stringify(teamJSON) + ")"];});

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

    $httpBackend.expect('POST', 'https://staging-api.bountysource.com/user/fundraisers').respond(function() { return [200, 'CORS({"data": {"slug": "asdfasdf"}, "meta": {"success": true}})']; });
    $rootScope.create();
    $httpBackend.flush();

    expect($location.url()).toEqual('/fundraisers/asdfasdf/edit');
  });

  it('sets error scope if the request was not successful', function() {
    var controller = createController();
    $httpBackend.flush();

    $httpBackend.expect('POST', 'https://staging-api.bountysource.com/user/fundraisers').respond(function() { return [200, 'CORS({"data": {"error": "There was an error"}, "meta": {"success": false}})']; });
    $rootScope.create();
    $httpBackend.flush();

    expect($rootScope.error).toEqual("There was an error");
  });
});
