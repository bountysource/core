'use strict';

angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.settings.support_levels', {
    url: "/settings/support_levels",
    title: "Support Levels",
    templateUrl: "salt/support_levels/index.html",
    controller: function($scope, support_levels) {
      $scope.support_levels = support_levels;
    },
    resolve: {
      support_levels: function($api) {
        return $api.support_levels.query().$promise;
      }
    }
  });
});
