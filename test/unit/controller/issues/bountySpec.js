'use strict';

describe('IssueShow', function() {
  beforeEach(module('app', 'mockedIssue'));

  var $rootScope, $routeParams, $window, $httpBackend, createController, issueJSON, createBountyController, $location;

  beforeEach(inject(function($injector, $http, issueJSON) {
    $rootScope = $injector.get('$rootScope');
    $location = $injector.get('$location');
    $httpBackend = $injector.get('$httpBackend');
    var $controller = $injector.get('$controller');
    $routeParams = $injector.get('$routeParams');
    $window = $injector.get('$window');

    createController = function() {
      return $controller('IssueShow', {'$scope': $rootScope});
    };

    createBountyController = function() {
      return $controller('CreateBountyController', {'$scope': $rootScope});
    };

    $httpBackend.expect('GET', 'https://staging-api.bountysource.com/issues/651929?callback=CORS&per_page=250')
    .respond( function() {return [200, "CORS(" + JSON.stringify(issueJSON) + ")"];} );

    $routeParams.id = 651929;
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('it sets proper defaults on bounty if none are passed in via routeParams', function() {
    var controller = createController();
    var controllerBounty = createBountyController();
    $httpBackend.flush();
    var sampleBounty = {
      amount: 0,
      anonymous: false,
      payment_method: 'google',
      fee: 0,
      total: 0,
      item_number: 'issues/651929'
    };

    expect($rootScope.bounty).toEqual(sampleBounty);
  });

  it('', function() {
    var controller = createController();
    var controllerBounty = createBountyController();
    $httpBackend.flush();

    $httpBackend.expect('POST', 'https://staging-api.bountysource.com/payments')
    .respond( function() {return [200, 'CORS({"data": {"jwt": "hjdsfhgkjshdflgkjshdfkg"}, "meta": {"success": true}})'];} );

    $rootScope.create_payment();
    $window.google = { payments: { inapp: { buy: function(options) {  } } } };
    $httpBackend.flush();
  });
});
