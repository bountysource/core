'use strict';

describe('FundraiserIndexController', function() {
  beforeEach(module('app', 'mockedFundraiser'));

  var $httpBackend, $rootScope, createController;

  beforeEach(inject(function($injector, defaultJSON) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.expect('GET', 'https://staging-api.bountysource.com/fundraisers?callback=CORS&per_page=250').respond(defaultJSON);

    $rootScope = $injector.get('$rootScope');

    var $controller = $injector.get('$controller');

    createController = function() {
      return $controller('FundraisersIndex', {'$scope': $rootScope});
    };
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should return a list of fundraisers', function() {
    var controller = createController();
    $httpBackend.flush();
  });
});
