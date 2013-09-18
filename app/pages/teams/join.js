'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/teams/:id/join', {
        templateUrl: 'pages/teams/join.html',
        controller: 'BaseTeamController',
        resolve: $person
      });
  })
  .controller('JoinTeamController', function ($scope, $routeParams, $location, $api) {
    // redirect if already a member. edge case.
    $scope.$watch("is_member", function(val) {
      if (val === true) {
        $location.url("/teams/"+$routeParams.id+"/members").replace();
      }
    });

    $scope.token = $routeParams.token;

    $scope.permissions = {
      public: $routeParams.public === 'false' || true,
      spender: $routeParams.spender === 'true' || false,
      admin: $routeParams.admin === 'true' || false
    };

    $scope.accept = function() {
      $api.team_invite_accept($routeParams.id, $routeParams.token).then(function() {
        $location.url("/teams/"+$routeParams.id+"/members").replace();
      });
    };
  });