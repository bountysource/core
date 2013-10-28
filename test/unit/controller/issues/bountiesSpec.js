'use strict';

describe('IssueBountiesController', function() {
  beforeEach(module('app', 'mockedIssue'));

  var $httpBackend, $routeParams, $rootScope, createController, $location;

  beforeEach(inject(function($injector, issueJSON, $http) {
    $location = $injector.get('$location');
    $rootScope = $injector.get('$rootScope');
    $httpBackend = $injector.get('$httpBackend');
    var $routeParams = $injector.get('$routeParams');

    var $controller = $injector.get('$controller');

    $httpBackend.when('GET', 'https://staging-api.bountysource.com/issues/651929?callback=CORS&per_page=250')
    .respond( function() {return [200, "CORS(" + JSON.stringify(issueJSON) + ")"];} );

    createController = function() {
      return $controller('IssueBountiesController', {'$scope': $rootScope});
    };

    $routeParams.id = 651929;
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have a bounties array with amounts filled in', function() {
    var controller = createController();
    $rootScope.issue.then(function(data) {expect(data.bounties.length).toBeGreaterThan(0);});
    $httpBackend.flush();
  });

  it('should set sort column when passed a different column', function() {
    var controller = createController();
    $rootScope.sort_by('created_at');
    $httpBackend.flush();
    expect($rootScope.sort_column).toEqual('created_at');
  });

  it('should set reverse to false if passed the same column', function() {
    var controller = createController();
    $rootScope.sort_by('amount');
    $httpBackend.flush();
    expect($rootScope.sort_reverse).toBeFalsy();
  });
});
