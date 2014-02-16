'use strict';

angular.module('app.controllers').controller('CancelAllEmailsController', ['$scope', '$routeParams', '$api', '$pageTitle', function($scope, $routeParams, $api, $pageTitle) {
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
}]);
