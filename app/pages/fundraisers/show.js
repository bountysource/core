'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id', {
        templateUrl: 'pages/fundraisers/show.html',
        controller: 'FundraiserShowController'
      });
  })

  .controller('FundraiserShowController', function ($scope, $rootScope, $routeParams, $location, $api) {
    $scope.fundraiser = $api.fundraiser_get($routeParams.id).then(function(response) {
      $scope.can_manage = response.person && $scope.current_person && response.person.id == $scope.current_person.id;
      $scope.funding_bar_style = { width: "50%" };
      return response;
    });

    $scope.edit = function() { $location.path("/fundraisers/"+$routeParams.id+"/edit") };
  });
