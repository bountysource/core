'use strict';

angular.module('fundraisers').controller('FundraiserIndexController', function($scope, $location, $api) {
  $scope.type = 'current';
  if ($location.path() === '/fundraisers/completed') {
    $scope.type = 'completed';
  }
  $scope.current = [];
  $scope.completed = [];

  $api.fundraisers_get().then(function(fundraisers) {
    for (var i=0; i<fundraisers.length; i++) {
      $scope.$init_fundraiser(fundraisers[i]);
    }
    $scope.select_fundraisers($scope.type);
    $scope.all = fundraisers;
    return fundraisers;
  });

  $scope.$init_fundraiser = function(fundraiser) {
    // add percentage to fundraisers
    fundraiser.$percentage = (fundraiser.total_pledged / fundraiser.funding_goal) * 100;

    // turn total_pledged into a number
    fundraiser.total_pledged = parseFloat(fundraiser.total_pledged);

    // push into either current or completed fundraisers arrays
    if (fundraiser.in_progress) {
      $scope.current.push(fundraiser);
    } else if (fundraiser.total_pledged >= fundraiser.funding_goal) {
      // it is completed, and was successfully funded
      $scope.completed.push(fundraiser);
    }
  };

  $scope.active_tab = function(type) {
    if (type === $scope.type) { return 'active'; }
  };

  $scope.select_fundraisers = function(type) {
    if (type === 'current') {
      $scope.type = type;
      $scope.selected_fundraisers = $scope.current;
    } else if (type === 'completed') {
      $scope.type = type;
      $scope.selected_fundraisers = $scope.completed;
    }
  };

  $scope.filter_options = {
    text: ""
  };

  $scope.filter_method = function(fundraiser) {
    // filter fundraisers by text
    if ($scope.filter_options.text.length > 0) {
      var regexp = new RegExp(".*?"+$scope.filter_options.text+".*?", "i");
      return regexp.test(fundraiser.title) || regexp.test(fundraiser.short_description);
    }

    return true;
  };

  $scope.order_by = ['+days_remaining'];
  $scope.order_reverse = false;
  $scope.change_order = function(order) {
    if (order === $scope.order_by) {
      $scope.order_reverse = !$scope.order_reverse;
    }
    $scope.order_by = order;
  };
});
