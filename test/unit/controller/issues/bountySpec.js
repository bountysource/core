'use strict';

describe('IssueShow', function() {
  beforeEach(module('app', 'mockedIssue'));

  var $rootScope, $api, $payment, $routeParams, $window, $httpBackend, createController, issueJSON, createBountyController, $location;

  beforeEach(inject(function($injector, $http, issueJSON) {
    $rootScope = $injector.get('$rootScope');
    $location = $injector.get('$location');
    $httpBackend = $injector.get('$httpBackend');
    var $controller = $injector.get('$controller');
    $routeParams = $injector.get('$routeParams');
    $window = $injector.get('$window');
    $payment = $injector.get('$payment');
    $api = $injector.get('$api');

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

  it('should set proper defaults on bounty if none are passed in via routeParams', function() {
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

  it('should complete a payment successfully', function() {
    var controller = createController();
    var controllerBounty = createBountyController();
    $httpBackend.flush();

    $httpBackend.expect('POST', 'https://staging-api.bountysource.com/payments')
    .respond( function() {return [200, 'CORS({"data": {"jwt": "hjdsfhgkjshdflgkjshdfkg"}, "meta": {"success": true}})'];} );

    spyOn($payment._default_options, 'success');
    $rootScope.create_payment();
    $window.google = { payments: { inapp: { buy: function(options) {  } } } };
    $httpBackend.flush();

    expect($payment._default_options.success).toHaveBeenCalledWith({ data : { jwt : 'hjdsfhgkjshdflgkjshdfkg' }, meta : { success : true } });
  });

  it('should throw an error in other cases (non 401)', function() {
    var controller = createController();
    var controllerBounty = createBountyController();
    $httpBackend.flush();

    $httpBackend.expect('POST', 'https://staging-api.bountysource.com/payments')
    .respond( function() {return [200, 'CORS({"data": {"error": "Something bad has happened"}, "meta": {"success": false}})'];} );

    spyOn($api, 'set_post_auth_url');
    $rootScope.create_payment();
    $window.google = { payments: { inapp: { buy: function(options) {  } } } };
    $httpBackend.flush();
    expect($rootScope.error).toEqual("Something bad has happened");
  });

  it('should throw an auth error when a 401 status is returned', function() {
    var controller = createController();
    var controllerBounty = createBountyController();
    $httpBackend.flush();

    $httpBackend.expect('POST', 'https://staging-api.bountysource.com/payments')
    .respond( function() {return [200, 'CORS({"data": {"jwt": ""}, "meta": {"success": false, "status": 401}})'];} );

    spyOn($api, 'set_post_auth_url');
    $rootScope.create_payment();
    $window.google = { payments: { inapp: { buy: function(options) {  } } } };
    $httpBackend.flush();

    expect($api.set_post_auth_url).toHaveBeenCalledWith('/issues/651929/bounty', { amount : 0,
                                                        anonymous : false, payment_method : 'google', total : 0, item_number : 'issues/651929',
                                                        success_url : 'http://localhost:8080/context.html/issues/651929/receipts/recent', cancel_url : 'http://localhost:8080/context.html' });
  });
});
