'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/teams/:id/bounties', {
        templateUrl: 'pages/teams/bounties.html',
        controller: 'BaseTeamController'
      });
  })
  .controller('TeamBountiesController', function ($scope, $routeParams, $api) {
    $scope.bounties_resolved = false;

    $scope.open_sort = {
      column: "created_at",
      desc: true
    };
    $scope.claimed_sort = {
      column: "issue.paid_at",
      desc: true
    };
    $scope.update_sort = function(obj, column) {
      if (obj.column == column) {
        obj.desc = !obj.desc;
      } else {
        obj.column = column;
        obj.desc = true;
      }
    };

    $api.team_bounties($routeParams.id).then(function(bounties) {
      var claimed_bounties = [];
      var open_bounties = [];
      var total_paid_out = 0;
      for (var i=0; i<bounties.length; i++) {
        var bounty = bounties[i];
        bounty.amount = parseInt(bounty.amount, 10);
        if (bounty.issue.paid_out) {
          claimed_bounties.push(bounty);
          total_paid_out += bounty.amount
        } else {
          open_bounties.push(bounty);
        }
      }
      $scope.claimed_bounties = claimed_bounties;
      $scope.open_bounties = open_bounties;
      $scope.total_paid_out = total_paid_out;

      $scope.bounties_resolved = true;
    });
  });