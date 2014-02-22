'use strict';

describe('FundraiserIndexController', function() {
  beforeEach(module('app', 'mockedFundraiser'));

  var $httpBackend, $rootScope, createController, $location;

  beforeEach(inject(function($injector, defaultJSON, $http) {
    $location = $injector.get('$location');
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.when('GET', 'https://staging-api.bountysource.com/fundraisers?callback=CORS&per_page=250').respond( function() { return [200, "CORS(" + JSON.stringify(defaultJSON) + ")"];} );

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

  it ('should switch type to completed based on location', function() {
    $location.path('/fundraisers/completed');
    var controller = createController();
    $httpBackend.flush();

    expect($rootScope.type).toBe('completed');
  });

  it('should return a list of completed fundraisers', function() {
    var controller = createController();
    $httpBackend.flush();

    expect($rootScope.completed.length).toBeGreaterThan(0);
  });

  it('should return a list of current fundraisers', function() {
    var controller = createController();
    $httpBackend.flush();

    expect($rootScope.current.length).toBeGreaterThan(0);
  });

  it('should be able to determine the active tab', function() {
    var controller = createController();
    $httpBackend.flush();

    expect($rootScope.active_tab('current')).toBe('active');
  });

  it('should return true when text string matches', function() {
    var controller = createController();
    $httpBackend.flush();

    $rootScope.filter_options.text = 'book';
    var fundraiser = $rootScope.current[1];
    expect($rootScope.filter_method(fundraiser)).toBeTruthy();

    $rootScope.filter_options.text = 'kindle';
    expect($rootScope.filter_method(fundraiser)).toBeTruthy();
  });

  it('should return false when text string does not match', function() {
    var controller = createController();
    $httpBackend.flush();

    $rootScope.filter_options.text = 'flabergasted';
    var fundraiser = $rootScope.current[1];
    expect($rootScope.filter_method(fundraiser)).toBeFalsy();
  });

  it('should return true when filter text is empty', function() {
    var controller = createController();
    $httpBackend.flush();

    var fundraiser = $rootScope.current[1];
    expect($rootScope.filter_method(fundraiser)).toBeTruthy();
  });

  it('should allow you to change what the list is ordered by', function() {
    var controller = createController();
    $httpBackend.flush();

    $rootScope.change_order('title');
    expect($rootScope.order_by).toBe('title');
  });

  it('', function() {
    var controller = createController();
    $httpBackend.flush();

    //called twice to test_old the branching
    $rootScope.change_order('title');
    $rootScope.change_order('title');
    expect($rootScope.order_reverse).toBeTruthy();
  });
});
