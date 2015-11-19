'use strict';

angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/activity_log', {
    templateUrl: 'admin/activity_log/index.html',
    controller: "ActivityLogIndexController"
  });
})
.controller("ActivityLogIndexController", function ($scope, $window, $api) {
  $api.get_activity_logs().then(function (activity_logs) {
    $scope.activity_logs = activity_logs;
  });
});
