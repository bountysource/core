'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/new', {
        templateUrl: 'pages/fundraisers/create.html',
        controller: 'FundraiserCreateController'
      });
  })

  .controller('FundraiserCreateController', function($scope, $routeParams, $api) {
    $scope.fr_title = "My Fundraiser";

    $scope.create = function () {
      var data = {
        title: $scope.fr_title,
        description: $scope.fr_description,
        short_description: $scope.fr_short_description
      };

      $scope.fundraiser = $api.fundraiser_create(data).then(function(response) {
        $location.path("/fundraisers/"+response.slug+"/edit");
        return response;
      });
    }
  });
