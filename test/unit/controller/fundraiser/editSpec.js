'use strict';

describe('FundraiserEditController', function() {
  beforeEach(module('app', 'mockedTeams', 'mockedFundraiserEdit'));

  var $httpBackend, $rootScope, createRewardController, createController, $location;

  beforeEach(inject(function($injector, teamJSON, fundraiserJSON, $http) {
    $location = $injector.get('$location');
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'https://staging-api.bountysource.com/people/4/teams?callback=CORS&per_page=250')
    .respond( function() { return [200, "CORS(" + JSON.stringify(teamJSON) + ")"];} );

    $httpBackend.when('GET', 'https://staging-api.bountysource.com/user/fundraisers/101?callback=CORS&per_page=250')
    .respond( function() { return [200, "CORS(" + JSON.stringify(fundraiserJSON) + ")"];} );

    $rootScope = $injector.get('$rootScope');

    var $controller = $injector.get('$controller');

    var $routeParams = $injector.get('$routeParams');

    createController = function() {
      return $controller('FundraiserEditController', {'$scope': $rootScope});
    };

    createRewardController = function() {
      return $controller('RewardsController', {'$scope': $rootScope});
    };

    // These define params required for the mocked requests urls
    $rootScope.current_person = {id: 4};
    $routeParams.id = 101;
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should populate the master & changes arrays with fundraiser details', function() {
    var controller = createController();
    $httpBackend.flush();

    expect($rootScope.changes.id).toBe(479);
    expect($rootScope.master.id).toBe(479);
  });

  it('should remove image url from the changes object', function() {
    var controller = createController();
    $httpBackend.flush();

    expect($rootScope.changes.image_url).toBeUndefined();
  });

  it('should return true when there are unsaved changes', function() {
    var controller = createController();
    $httpBackend.flush();

    expect($rootScope.unsaved_changes()).toBeTruthy();
  });

  it('should return the proper location when we call cancel', function() {
    var controller = createController();
    $httpBackend.flush();

    $rootScope.cancel();
    expect($location.url()).toEqual('/fundraisers/479-read-books-get-literate');
  });

  it('should set the proper location on a save', function() {
    var controller = createController();
    $httpBackend.flush();

    $httpBackend.expect('PUT', 'https://staging-api.bountysource.com/user/fundraisers/101')
    .respond(function() { return [200, 'CORS({"data": {"slug": "asdfasdf"}, "meta": {"success": true}})']; });
    $rootScope.save();
    $httpBackend.flush();

    expect($location.url()).toEqual('/fundraisers/479-read-books-get-literate');
  });

  it('should set an error on failure of update', function() {
    var controller = createController();
    $httpBackend.flush();

    $httpBackend.expect('PUT', 'https://staging-api.bountysource.com/user/fundraisers/101')
    .respond(function() { return [200, 'CORS({"data": {"error": "Uh Oh, there was an error"}, "meta": {"success": false}})']; });
    $rootScope.save();
    $httpBackend.flush();

    expect($rootScope.error).toEqual('Uh Oh, there was an error');
  });

  it('it pushes a new reward onto the table', function() {
    var controller = createController();
    var reward_ctrl = createRewardController();
    $httpBackend.flush();
    $rootScope.new_reward = {
      "id": 10001,
      "amount": 2000,
      "description": "beautiful set of stationary that I have hand painted",
      "claimed": 0,
      "limited_to": null,
      "sold_out": false,
      "created_at": "2013-09-27T19:03:54Z",
      "fulfillment_details": "home address"
    };

    $httpBackend.expect('POST', 'https://staging-api.bountysource.com/user/fundraisers/479/rewards')
    .respond(function() { return [200, 'CORS({"data": {"fake_reward": "this is a fake reward"}, "meta": {"success": true}})']; });

    // passing in master so I don't need to create another fundraiser object
    $rootScope.create_reward($rootScope.master);
    $httpBackend.flush();
    expect($rootScope.new_reward).toEqual({});
    expect($rootScope.master.rewards.length).toEqual(2);
  });

  it('it should set a reward error if something fails', function() {
    var controller = createController();
    var reward_ctrl = createRewardController();
    $httpBackend.flush();

    $httpBackend.expect('POST', 'https://staging-api.bountysource.com/user/fundraisers/479/rewards')
    .respond(function() { return [200, 'CORS({"data": {"error": "Uh Oh, there was an error"}, "meta": {"success": false}})']; });

    // passing in master so I don't need to create another fundraiser object
    $rootScope.create_reward($rootScope.master);
    $httpBackend.flush();

    expect($rootScope.reward_error).toEqual("Uh Oh, there was an error");
  });

  it('it should update the reward accordingly', function() {
    var controller = createController();
    var reward_ctrl = createRewardController();
    $httpBackend.flush();
    $rootScope.rewards = [{
      "id": 10001,
      "amount": 100,
      "description": "fooo",
      "claimed": 0,
      "limited_to": null,
      "sold_out": false,
      "created_at": "2013-09-27T19:03:54Z",
      "fulfillment_details": "home address"
    }];
    $rootScope.master_rewards = [{
      "id": 10001,
      "amount": 2000,
      "description": "beautiful set of stationary that I have hand painted",
      "claimed": 0,
      "limited_to": null,
      "sold_out": false,
      "created_at": "2013-09-27T19:03:54Z",
      "fulfillment_details": "home address"
    }];

    $httpBackend.expect('PUT', 'https://staging-api.bountysource.com/user/fundraisers/479/rewards/10001')
    .respond(function() { return [200, 'CORS({"data": {"amount": 100}, "meta": {"success": true}})']; });

    // passing in master so I don't need to create another fundraiser object
    $rootScope.update_reward($rootScope.master, {"id": 10001});
    $httpBackend.flush();

    expect($rootScope.master_rewards[0].amount).toEqual(100);
    expect($rootScope.master_rewards[0].description).toEqual('fooo');
    expect($rootScope.reward_error).toBeUndefined();
  });

  it('it should set error if reward cannot be updated', function() {
    var controller = createController();
    var reward_ctrl = createRewardController();
    $httpBackend.flush();
    $rootScope.rewards = [{
      "id": 10001,
      "amount": 100,
      "description": "fooo",
      "claimed": 0,
      "limited_to": null,
      "sold_out": false,
      "created_at": "2013-09-27T19:03:54Z",
      "fulfillment_details": "home address"
    }];
    $rootScope.master_rewards = [{
      "id": 10001,
      "amount": 2000,
      "description": "beautiful set of stationary that I have hand painted",
      "claimed": 0,
      "limited_to": null,
      "sold_out": false,
      "created_at": "2013-09-27T19:03:54Z",
      "fulfillment_details": "home address"
    }];

    $httpBackend.expect('PUT', 'https://staging-api.bountysource.com/user/fundraisers/479/rewards/10001')
    .respond(function() { return [200, 'CORS({"data": {"error": "Darn, something went wrong"}, "meta": {"success": false}})']; });

    // passing in master so I don't need to create another fundraiser object
    $rootScope.update_reward($rootScope.master, {"id": 10001});
    $httpBackend.flush();

    expect($rootScope.reward_error).toEqual('Darn, something went wrong');
  });

  it('it should allow you to cancel an update', function() {
    var controller = createController();
    var reward_ctrl = createRewardController();
    $httpBackend.flush();
    $rootScope.rewards = [{
      "id": 10001,
      "amount": 100,
      "description": "fooo",
      "claimed": 0,
      "limited_to": null,
      "sold_out": false,
      "created_at": "2013-09-27T19:03:54Z",
      "fulfillment_details": "home address"
    }];
    $rootScope.master_rewards = [{
      "id": 10001,
      "amount": 2000,
      "description": "beautiful set of stationary that I have hand painted",
      "claimed": 0,
      "limited_to": null,
      "sold_out": false,
      "created_at": "2013-09-27T19:03:54Z",
      "fulfillment_details": "home address"
    }];

    // passing in master so I don't need to create another fundraiser object
    $rootScope.cancel_reward_changes({"id": 10001});

    expect($rootScope.master_rewards[0].description).toEqual($rootScope.rewards[0].description);
    expect($rootScope.rewards[0].$is_open).toBeFalsy();
  });

  it('it should destroy a reward', function() {
    var controller = createController();
    var reward_ctrl = createRewardController();
    $httpBackend.flush();

    $httpBackend.expect('DELETE', 'https://staging-api.bountysource.com/user/fundraisers/479/rewards/876?callback=CORS&per_page=250')
    .respond(function() { return [200, 'CORS({"data": {}, "meta": {"success": true}})']; });

    // passing in master so I don't need to create another fundraiser object
    $rootScope.destroy_reward($rootScope.master, {"id": 876});
    $httpBackend.flush();

    expect($rootScope.master.rewards.length).toEqual(0);
  });
});
