'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id/updates', {
        templateUrl: 'pages/fundraisers/updates.html',
        controller: 'FundraiserUpdatesController'
      });
  })

  .controller('FundraiserUpdatesController', function ($scope, $routeParams, $location, $api) {
    $api.fundraiser_get($routeParams.id).then(function(fundraiser) {
      $scope.fundraiser = fundraiser;
      $scope.updates = fundraiser.updates;
      return fundraiser;
    });

    $scope.create_update = function() {
      $api.fundraiser_update_create($routeParams.id, {}, function(response) {
        if (response.meta.success) {
          var fundraiser = response.data;
          var update = response.data.update;
          $location.url("/fundraisers/"+fundraiser.slug+"/updates/"+update.id+"/edit");
        } else {
          $scope.error = response.data.error;
        }
      });
    };
  });
