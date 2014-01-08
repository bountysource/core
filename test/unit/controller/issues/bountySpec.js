'use strict';

describe('IssueShow', function() {
  beforeEach(module('app', 'mockedIssue', 'mockedTeams'));

  var $rootScope, $api, $routeParams, $window, $httpBackend, createController, issueJSON, teamJSON, createBountyController, $location, $cart;

  beforeEach(inject(function($injector, $http, issueJSON, teamJSON) {
    $rootScope = $injector.get('$rootScope');
    $location = $injector.get('$location');
    $httpBackend = $injector.get('$httpBackend');
    var $controller = $injector.get('$controller');
    $routeParams = $injector.get('$routeParams');
    $window = $injector.get('$window');
    $cart = $injector.get('$cart');
    $api = $injector.get('$api');

    createController = function() {
      return $controller('IssuesBaseController', {'$scope': $rootScope});
    };

    createBountyController = function() {
      return $controller('CreateBountyController', {'$scope': $rootScope});
    };

    $httpBackend.expect('GET', 'https://staging-api.bountysource.com/issues/651929?callback=CORS&per_page=250')
    .respond( function() {return [200, "CORS(" + JSON.stringify(issueJSON) + ")"];} );

    $httpBackend.when('GET', 'https://staging-api.bountysource.com/people/4/teams?callback=CORS&per_page=250')
    .respond( function() {return [200, "CORS(" + JSON.stringify(teamJSON) + ")"];} );

    $httpBackend.when('GET', 'https://staging-api.bountysource.com/user/issues/651929/bounty_total?callback=CORS&per_page=250')
    .respond( function() {return [200, "CORS(" + JSON.stringify({"data":{"bounty_total":0}}) + ")"];} );

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
      amount: 15,
      anonymous: false,
      checkout_method: 'google',
      bounty_expiration: '',
      upon_expiration: '',
      promotion: '',
      fee: 0,
      total: 0
    };

    expect($rootScope.bounty).toEqual(sampleBounty);
  });

//  TODO: Need tests to update to $cart
//  it('should complete a payment successfully', function() {
//    var controller = createController();
//    var controllerBounty = createBountyController();
//    $httpBackend.flush();
//
//    $httpBackend.expect('POST', 'https://staging-api.bountysource.com/payments')
//    .respond( function() {return [200, 'CORS({"data": {"jwt": "hjdsfhgkjshdflgkjshdfkg"}, "meta": {"success": true}})'];} );
//
//    spyOn($payment._default_options, 'success');
//    $rootScope.create_payment();
//    $window.google = { payments: { inapp: { buy: function(options) {  } } } };
//    $httpBackend.flush();
//
//    expect($payment._default_options.success).toHaveBeenCalledWith({ data : { jwt : 'hjdsfhgkjshdflgkjshdfkg' }, meta : { success : true } });
//  });
//
//  xit('should throw an error in other cases (non 401)', function() {
//    var controller = createController();
//    var controllerBounty = createBountyController();
//    $httpBackend.flush();
//
//    $httpBackend.expect('POST', 'https://staging-api.bountysource.com/payments')
//    .respond( function() {return [200, 'CORS({"data": {"error": "Something bad has happened"}, "meta": {"success": false}})'];} );
//
//    spyOn($api, 'set_post_auth_url');
//    $rootScope.create_payment();
//    $window.google = { payments: { inapp: { buy: function(options) {  } } } };
//    $httpBackend.flush();
//    expect($rootScope.error).toEqual("Something bad has happened");
//  });
//
//  xit('should throw a forbidden when a 403 status is returned', function() {
//    var controller = createController();
//    var controllerBounty = createBountyController();
//    $rootScope.bounty.payment_method = "team/100000";
//    $httpBackend.flush();
//
//    $httpBackend.expect('POST', 'https://staging-api.bountysource.com/payments')
//    .respond( function() {return [200, 'CORS({"data": {"error": "eric"}, "meta": {"success": false, "status": 403}})'];} );
//
//    $rootScope.create_payment();
//    $window.google = { payments: { inapp: { buy: function(options) {  } } } };
//    $httpBackend.flush();
//
//    expect($rootScope.error).toEqual("You do not have permission to do that.");
//  });
//
//  xit('should throw an auth error when a 401 status is returned', function() {
//    var controller = createController();
//    var controllerBounty = createBountyController();
//    $httpBackend.flush();
//
//    $httpBackend.expect('POST', 'https://staging-api.bountysource.com/payments')
//    .respond( function() {return [200, 'CORS({"data": {"jwt": ""}, "meta": {"success": false, "status": 401}})'];} );
//
//    spyOn($api, 'set_post_auth_url');
//    $rootScope.create_payment();
//    $window.google = { payments: { inapp: { buy: function(options) {  } } } };
//    $httpBackend.flush();
//
//    expect($api.set_post_auth_url).toHaveBeenCalledWith('/issues/651929/bounty', { amount : 0,
//                                                        anonymous : false, payment_method : 'google',
//                                                        success_url : 'http://localhost:8080/context.html/issues/651929/receipts/recent', cancel_url : 'http://localhost:8080/context.html' });
//  });

  it('should watch current person and show fee', function() {
    var controller = createController();
    var controllerBounty = createBountyController();

    $rootScope.current_person = {id: 4};
    $rootScope.bounty.checkout_method = "team/130";

    $httpBackend.flush();

    expect($rootScope.selected_team).toEqual({is_public : true, is_developer : true, is_admin : true, id : 130, name : 'Focaccia, Inc #yoloswag', slug : 'focaccia',
                                             url : 'https://en.wikipedia.org/wiki/Focaccia',
                                             image_url : 'https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/k8y1g92ktgeam2ad8fop.jpg',
                                             medium_image_url : 'https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/k8y1g92ktgeam2ad8fop.jpg',
                                             large_image_url : 'https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/k8y1g92ktgeam2ad8fop.jpg',
                                             created_at : '2013-08-29T01:12:37Z', featured : false });
    expect($rootScope.show_fee).toBeFalsy();
  });

//  TODO Undisable/change
//  it('should watch current person and not show the fee if an Enterprise', function() {
//    var controller = createController();
//    var controllerBounty = createBountyController();
//
//    $rootScope.current_person = {id: 4};
//    $rootScope.bounty.payment_method = "team/1";
//
//    $httpBackend.flush();
//
//    expect($rootScope.show_fee).toBeFalsy();
//  });

  it('should set the selected team if you need it', function() {
    var controller = createController();
    var controllerBounty = createBountyController();

    $rootScope.select_team({test_team_id: 4});

    $httpBackend.flush();

    expect($rootScope.selected_team).toEqual({test_team_id: 4});
  });

//  TODO undisable
//  it('should watch bounty.payment method for Enterprise', function() {
//    var controller = createController();
//    var controllerBounty = createBountyController();
//
//    $rootScope.bounty = {payment_method: "team/130"};
//    $rootScope.selected_team = {type: "Team::Enterprise"};
//
//    $httpBackend.flush();
//
//    expect($rootScope.has_fee).toBeFalsy();
//    expect($rootScope.show_fee).toBeFalsy();
//  });

  it('should watch bounty.payment method for personal', function() {
    var controller = createController();
    var controllerBounty = createBountyController();

    $rootScope.bounty = {checkout_method: "personal"};

    $httpBackend.flush();

    expect($rootScope.has_fee).toBeFalsy();
    expect($rootScope.show_fee).toBeFalsy();
  });

  it('should watch has_fee and add the fee according accordingly', function() {
    var controller = createController();
    var controllerBounty = createBountyController();

    $rootScope.has_fee = true;
    $rootScope.bounty = {total: 12.00};

    $httpBackend.flush();

    expect($rootScope.bounty.fee).toEqual(1.2000000000000002);
    expect($rootScope.bounty.total).toEqual(13.2);
  });

  it('should set bounty fee and amount when bounty is updated', function() {
    var controller = createController();
    var controllerBounty = createBountyController();

    $rootScope.bounty = {total: 12.00};
    $rootScope.has_fee = true;
    $rootScope.update_bounty_amount();

    $httpBackend.flush();
    expect($rootScope.bounty.fee).toEqual(1.2000000000000002);
    expect($rootScope.bounty.amount).toEqual(10.91);
  });

  it('should set bounty fee and total when total needs to be updated', function() {
    var controller = createController();
    var controllerBounty = createBountyController();

    $rootScope.bounty = {amount: 12.00};
    $rootScope.has_fee = true;
    $rootScope.update_bounty_total();

    $httpBackend.flush();
    expect($rootScope.bounty.fee).toEqual(1.32);
    expect($rootScope.bounty.total).toEqual(14.52);
  });

  it('should cover the zero else cases on total', function() {
    var controller = createController();
    var controllerBounty = createBountyController();

    $rootScope.bounty = {total: ""};

    $rootScope.update_bounty_total();

    $httpBackend.flush();

    expect($rootScope.bounty.fee).toEqual(0);
    expect($rootScope.bounty.total).toEqual(0);
  });

  it('should cover the zero else cases on amount', function() {
    var controller = createController();
    var controllerBounty = createBountyController();

    $rootScope.bounty = {total: ""};

    $rootScope.update_bounty_amount();

    $httpBackend.flush();

    expect($rootScope.bounty.fee).toEqual(0);
    expect($rootScope.bounty.amount).toEqual(0);
  });
});
