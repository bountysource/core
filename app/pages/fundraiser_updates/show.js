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
    $scope.fundraiser = $api.fundraiser_get($routeParams.fundraiser_id).then(function(response) {
      $scope.num_pages = response.updates.length;
      $scope.current_page = 1;
      $scope.max_size = 10;

      return response;
    });

    var update_load_callback = function(response) {
      // what the hell, why is the update inside of a fundraiser object?
      var update = response.update;

      // set the page!
      $scope.current_page = update.number;

      return update;
    };

    $scope.update = $api.fundraiser_update_get($routeParams.fundraiser_id, $routeParams.id).then(update_load_callback);

    $scope.load_update = function(id) {
      $scope.update = $api.fundraiser_update_get($routeParams.fundraiser_id, id).then(update_load_callback);
    };
  });
