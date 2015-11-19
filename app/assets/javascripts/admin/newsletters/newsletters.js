'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/newsletters', {
        templateUrl: 'admin/newsletters/newsletters.html',
        controller: "Newsletter"
      });
  })
  .controller("Newsletter", function ($scope, $window, $api) {
    $scope.syncing = false;
    $scope.finished = !$scope.syncing;

    $scope.syncNewsletters = function() {
      $scope.syncing = true;
      $api.sync_newsletter().then(function(response) {
        if (response.meta.success) {
          $scope.syncing = false;
          $scope.finished = !$scope.sycning;
          //render the data
        } else {
          $scope.sycning = false;
          $scope.error = response.data.error;
          //render the error
        }
      });
    };
  });
