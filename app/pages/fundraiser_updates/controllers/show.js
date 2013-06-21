'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:fundraiser_id/updates/:id', {
        templateUrl: 'pages/fundraiser_updates/show.html',
        controller: 'FundraiserUpdatesShow'
      });
  })

  .controller('FundraiserUpdatesShow', function ($scope, $routeParams, $location, $api) {
    $scope.fundraiser = $api.fundraiser_update_get($routeParams.fundraiser_id, $routeParams.id).then(function(response) {
      $scope.update = response.update;
      return response;
    });

    $scope.publish = function() {
      console.log('meep');
      $api.fundraiser_update_publish($routeParams.fundraiser_id, $routeParams.id, function(response) {
        if (response.meta.success) {
          $location.url("/fundraisers/"+$routeParams.fundraiser_id+"/updates/"+$routeParams.id);
        } else {
          $scope.error = response.data.error;
        }
        return response.data;
      });
    };

    $scope.destroy = function() {
      $api.fundraiser_update_destroy($routeParams.fundraiser_id, $routeParams.id, function(response) {
        if (response.meta.success) {
          $location.url("/fundraisers/"+$routeParams.fundraiser_id+"/updates");
        } else {
          $scope.error = response.data.error;
        }
      });
    };
  });
