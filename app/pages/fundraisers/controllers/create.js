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
    $scope.fundraiser = {
      funding_goal: 25000,
      total_pledged: 0,
      pledge_count: 0,
      funding_percentage: 0,
      days_remaining: 30
    };

    $scope.create = function() {
      $api.fundraiser_create($scope.fundraiser, function(response) {
        if (response.meta.success) {
          $location.url("/fundraisers/"+response.data.slug+"/edit");
        } else {
          $scope.error = response.data.error;
        }
      });
    };
  });
