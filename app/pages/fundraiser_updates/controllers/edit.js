'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:fundraiser_id/updates/:id/edit', {
        templateUrl: 'pages/fundraiser_updates/edit.html',
        controller: 'FundraiserEditUpdateController'
      });
  })

  .controller('FundraiserEditUpdateController', function ($scope, $routeParams, $location, $api) {
    $scope.changes = {};

    $scope.fundraiser = $api.fundraiser_update_get($routeParams.fundraiser_id, $routeParams.id, function(response) {
      $scope.update = response.data.update;
      $scope.changes = $scope.update;
      return response.data;
    });

    $scope.save = function() {
      $api.fundraiser_update_edit($routeParams.fundraiser_id, $routeParams.id, $scope.changes, function(response) {
        if (response.meta.success) {
          $scope.back();
        } else {
          $scope.error = response.data.error;
        }
      });
    };

    $scope.back = function() {
      $location.url("/fundraisers/"+$routeParams.fundraiser_id+"/updates/"+$routeParams.id);
    };
  });
