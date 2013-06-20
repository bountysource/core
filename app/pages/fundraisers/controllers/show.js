'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id', {
        templateUrl: 'pages/fundraisers/show.html',
        controller: 'FundraiserShowController'
      });
  })

  .controller('FundraiserShowController', function ($scope, $routeParams, $location, $api) {
    $scope.fundraiser = $scope.fundraiser || $api.fundraiser_get($routeParams.id).then(function(r) {
      // authorization
      $scope.can_manage = r.person && $scope.current_person && r.person.id === $scope.current_person.id;

      // calculate percentage bar
      $scope.funding_percentage = Math.min(r.total_pledged / r.funding_goal, 100) * 100;

      return r;
    });
  });
