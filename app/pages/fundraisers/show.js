'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id', {
        templateUrl: 'pages/fundraisers/show.html',
        controller: 'FundraisersController'
      })

      .when('/fundraisers/new', {
        templateUrl: 'pages/fundraisers/show.html',
        controller: 'FundraisersController'
      });
  })

  .controller('FundraisersController', function ($scope, $routeParams, $q, $api) {
    $scope.new  = !$routeParams.id && !$scope.fundraiser;
    $scope.edit = !$scope.new && $routeParams.mode === 'edit';

    $scope.fundraiser = $scope.new ? undefined : $api.fundraiser_get($routeParams.id).then(function(response) {
      console.log('fundraiser', response);

      // initialize edit models
      $scope.fr_title = response.title;
      $scope.fr_description = response.description;
      $scope.fr_short_description = response.short_description;

      return response;
    });

    $scope.pledges = $scope.new ? undefined : $api.fundraiser_pledges_get($routeParams.id).then(function(response) {
      console.log('pledges', response);
      return response;
    });

    $scope.save = function() {
      var data = {
        title: $scope.fr_title,
        description: $scope.fr_description,
        short_description: $scope.fr_short_description
      };

      if ($scope.new) {
        // POST for create
        console.log('TODO save create', this.data);
      } else {
        // PUT for update
        console.log('save update', this.data);

        $api.fundraiser_update($routeParams.id, data).then(function(response) {
          console.log('update fundraiser', response);
          return response;
        });
      }
    };

    $scope.cancel = function() {
      $scope.edit = false;
      console.log('cancel');
    };
  });
