'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/new', {
        templateUrl: 'pages/fundraisers/create.html',
        controller: 'FundraiserCreateController'
      });
  })

  .controller('FundraiserCreateController', function($scope, $routeParams, $location, $api) {
    $scope.changes = {};

    $scope.alerts = [];
    $scope.close_alert = function(i) { $scope.alerts.splice(i,1); };

    $scope.create = function() {
      $api.fundraiser_create($scope.changes).then(function(response) {

        console.log(response);

        if (response.error) {
          $scope.alerts.push({ type: 'error', msg: response.error });
        } else {
          $location.path("/fundraisers/"+response.slug+"/edit");
        }

        return response;
      });
    };
  });
