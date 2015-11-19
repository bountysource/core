'use strict';

angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.home', {
    templateUrl: "salt/home/base.html",
    container: false,
    controller: function($scope, global_summary) {
      $scope.global_summary = global_summary;
    },
    resolve: {
      global_summary: function($api) {
        return $api.support_levels.global_summary().$promise;
      }
    }
  });
});
