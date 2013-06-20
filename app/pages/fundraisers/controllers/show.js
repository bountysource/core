'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id', {
        templateUrl: 'pages/fundraisers/show.html',
        controller: 'FundraiserShowController'
      });
  })

  .controller('FundraiserShowController', function ($scope, $routeParams, $location, $window, $api) {
    $scope.fundraiser = $api.fundraiser_get($routeParams.id);

    $scope.publish = function(fundraiser) {
      $api.fundraiser_publish(fundraiser.id, function(response) {
        if (response.meta.success) {
          // TODO I do not know why this doesn't work: $location.url("/fundraisers/"+fundraiser.slug).replace();
          $window.location = "/fundraisers/"+fundraiser.slug;
        } else {
          $scope.error = "ERROR: " + response.data.error;
        }

        return response.data;
      });
    };
  });
