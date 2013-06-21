'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id/pledge', {
        templateUrl: 'pages/pledges/new.html',
        controller: 'FundraiserPledgeCreateController'
      });
  })

  .controller('FundraiserPledgeCreateController', function ($scope, $routeParams, $location, $api) {
    $scope.redirect_base_url = $location.protocol() + '://' +$location.host() + ($location.port() ? ':' + $location.port() : '') + '/fundraisers/' + $routeParams.id;

    $scope.pledge = {
      amount: parseInt($routeParams.amount, 10) || 100,
      anonymous: $routeParams.anonymous || false,
      payment_method: $routeParams.payment_method || 'google',
      reward_id: parseInt($routeParams.reward_id, 10) || 0,
      success_url: $scope.redirect_base_url + '/pledges/:item_id',
      cancel_url: $scope.redirect_base_url
    };

    $scope.fundraiser = $api.fundraiser_get($routeParams.id).then(function(response) {
      // add the base item number, with just fundraiser id
      $scope.pledge.base_item_number = 'fundraisers/'+response.id;
      $scope.pledge.item_number = $scope.pledge.base_item_number;

      // select reward to have the object cached. handled after this by set_reward(reward)
      $scope.selected_reward = null;
      for (var i=0; $scope.pledge.reward_id && i<response.rewards.length; i++) {
        if (response.rewards[i].id === $scope.pledge.reward_id) {
          $scope.selected_reward = response.rewards[i];
          break;
        }
      }

      return response;
    });

    $scope.set_reward = function(reward) {
      $scope.selected_reward = reward;
      $scope.pledge.reward_id = reward.id || 0;

      // add reward item to item number
      $scope.pledge.item_number = $scope.pledge.base_item_number + (reward.id === 0 ? '' : '/'+reward.id);

      // if the reward amount is higher than current pledge amount, raise it.
      if (reward.amount && (!$scope.pledge.amount || $scope.pledge.amount < reward.amount)) {
        $scope.pledge.amount = reward.amount;
      }
    };

    $scope.alert = null;
    $scope.create_payment = function() {
      // append post-signin URL with that data
      $scope.pledge.postauth_url = $scope.redirect_base_url + '/pledge?payment_method='+$scope.pledge.payment_method+'&amount='+$scope.pledge.amount+'&anonymous='+$scope.pledge.anonymous;
      if ($scope.pledge.reward_id) {
        $scope.pledge.postauth_url = $scope.pledge.postauth_url + '&reward_id='+$scope.pledge.reward_id;
      }

      // kill off extra attributes
      var payment_params = angular.copy($scope.pledge);
      delete payment_params.reward;
      delete payment_params.base_item_number;

      $api.process_payment($scope, $scope.pledge);
    };
  });
