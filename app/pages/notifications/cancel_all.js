'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/notifications/cancel_all', {
        templateUrl: 'pages/notifications/cancel_all.html',
        controller: 'CancelAllEmailsController'
      });
  }).controller('CancelAllEmailsController', function($scope, $routeParams, $api, $pageTitle) {
    $pageTitle.set("Unsubscribe from Bountysource Emails");

    $scope.email = $routeParams.email;
    $scope.approved = false;

    $scope.unsubscribe = function() {
      $scope.approved = true;
      $scope.processing = true;

      $api.cancel_all_notifications($scope.email).then(function(success) {
        $scope.success = success;
        $scope.processing = false;
      });
    };
  });
