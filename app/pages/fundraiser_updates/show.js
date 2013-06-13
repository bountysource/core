'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:fundraiser_id/updates/:id', {
        templateUrl: 'pages/fundraiser_updates/show.html',
        controller: 'FundraiserUpdatesShow'
      });
  })

  .controller('FundraiserUpdatesShow', function ($scope, $routeParams, $api) {
    $scope.num_pages = 1;
    $scope.current_page = 1;
    $scope.max_size = 10;

    $scope.fundraiser = $api.fundraiser_get($routeParams.fundraiser_id).then(function(response) {
      console.log('fundraiser', response);

      $scope.num_pages = response.updates.length;

      return response;
    });

    $scope.update = $api.fundraiser_update_get($routeParams.fundraiser_id, $routeParams.id).then(function(response) {
      console.log('update', response);

      // what the hell, why is the update inside of a fundraiser object?
      var update = response.update;

      // set the page!
      $scope.current_page = update.number;

      return update;
    });
  });
