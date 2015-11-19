'use strict';

angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.checkout.display', {
    parent: 'root.checkout.authed',
    url: "/checkout/display?team&amount&display_as&reward_id&support_level_id",
    title: "Display As - Checkout",
    templateUrl: "salt/checkout/display.html",
    container: false,
    controller: function($scope, $state, $stateParams, $api, $window, $env) {
      var support_level_display_as;
      if ($scope.support_level && !$scope.support_level.owner.type) {
        support_level_display_as = 'anonymous';
      } else if ($scope.support_level && $scope.support_level.owner.type === 'Person') {
        support_level_display_as = 'me';
      } else if ($scope.support_level && $scope.support_level.owner.type === 'Team') {
        support_level_display_as = 'team' + $scope.support_level.owner.id;
      }

      $scope.form_data = {
        display_as: $stateParams.display_as || support_level_display_as || 'me'
      };

      $scope.submit_form = function() {
        $state.transitionTo('root.checkout.payment', angular.extend({}, $stateParams, $scope.form_data));
      };
    }
  });
});
