angular.module('app')
  .controller('TeamFundraiserController', function($scope, $window, $location, $cart, $routeParams, $route, $api) {
    if ($routeParams.id === 'crystal-lang') {
      $window.location.replace('https://salt.bountysource.com/teams/crystal-lang');
      return;
    }

    // Change page content based on query param
    $scope._page = $location.search().page;

    // Is this the currently active page?
    $scope.activePage = function(page) {
      page = (page || '').toLowerCase();
      return page === ($location.search().page || '').toLowerCase();
    };

    // Watching a string didn't work here. Watch the route params and update pledge fields accordingly
    $scope.$watch(function () {return $location.search();}, function (newParams) {
      $scope.pledge = {
        amount: newParams.amount || angular.noop,
        anonymous: (parseInt(newParams.anonymous, 10) === 1) || false,
        survey_response: newParams.survey_response || "",
        reward_id: parseInt(newParams.reward_id, 10) || null
      };
    });

    $scope.fundraiser_hide_pledge_button = true;

    $scope.$watch('activeFundraiser', function(fundraiser) {
      if (fundraiser === false) {
        $location.url('/teams/' + $routeParams.id);

      } else if (fundraiser) {
        // select reward to have the object cached. handled after this by set_reward(reward)
        $scope.selected_reward = null;

        for (var i=0; $scope.pledge.reward_id && i<fundraiser.rewards.length; i++) {
          if (fundraiser.rewards[i].id === $scope.pledge.reward_id) {
            $scope.selected_reward = fundraiser.rewards[i];
            break;
          }
        }

        // Add item to cart, awesome
        $scope.addToCart = function () {
          var payload = angular.copy($scope.pledge);
          payload.fundraiser_id = fundraiser.id;

          $cart.addPledge(payload);
        };
      }
    });

    $scope.set_reward = function(reward) {
      $scope.selected_reward = reward;
      $scope.pledge.reward_id = reward.id || 0;

      // add reward item to item number
      if ($scope.selected_reward) {
        $scope.pledge.item_number = $scope.pledge.base_item_number + '/' + reward.id;
      } else {
        $scope.pledge.item_number = $scope.pledge.base_item_number;
      }

      // if the reward amount is higher than current pledge amount, raise it.
      if (reward.amount && (!$scope.pledge.amount || $scope.pledge.amount < reward.amount)) {
        $scope.pledge.amount = reward.amount;
      }
    };

    $scope.can_make_anonymous = true;

    // watch payment method for team account.
    // if it is, disable the anonymous checkbox
    $scope.$watch("pledge.checkout_method", function(checkout_method) {
      if ((/^team\/\d+$/).test(checkout_method)) {
        $scope.can_make_anonymous = false;
      } else {
        $scope.can_make_anonymous = true;
      }
    });

  });
