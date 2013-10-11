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

    $httpBackend.expect('GET', 'https://staging-api.bountysource.com/issues/651929?callback=CORS&per_page=250')
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

  it('', function() {
    var controller = createController();
    $httpBackend.flush();

    dump($rootScope.issue.then());
  });
});
