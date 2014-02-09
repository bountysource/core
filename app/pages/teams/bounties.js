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

    $scope.summary_sort = {
      column: 'open',
      desc: true
    };

    $scope.open_sort = {
      column: "created_at",
      desc: true
    };

    $scope.claimed_sort = {
      column: "issue.paid_at",
      desc: true
    };

    $scope.update_sort = function(obj, column) {
      if (obj.column === column) {
        obj.desc = !obj.desc;
      } else {
        obj.column = column;
        obj.desc = true;
      }
    };

    function incrementStats (bounty, paid_out) {
      var tracker = bounty.issue.tracker;
      if(paid_out) {
        // simple imcrement if tracker object already exists
        if ($scope.stats_map[tracker.name] && $scope.stats_map[tracker.name].paid_out > 0) {
          $scope.stats_map[tracker.name].paid_out += bounty.amount;
        // tracker object exists but hasn't been set, set paid_out amount
        } else if ($scope.stats_map[tracker.name]) {
          $scope.stats_map[tracker.name].paid_out = bounty.amount;
        //object doesn't exist, create and set
        } else {
          $scope.stats_map[tracker.name] = {paid_out: bounty.amount, open: 0, slug: tracker.slug, name: tracker.name, image_url: tracker.image_url};
        }
      } else {
        if ($scope.stats_map[tracker.name] && $scope.stats_map[tracker.name].open > 0) {
          $scope.stats_map[tracker.name].open += bounty.amount;
        } else if ($scope.stats_map[tracker.name]) {
          $scope.stats_map[tracker.name].open = bounty.amount;
        } else {
          $scope.stats_map[tracker.name] = {open: bounty.amount, paid_out: 0, slug: tracker.slug, name: tracker.name, image_url: tracker.image_url};
        }
      }
    }

    $api.team_bounties($routeParams.id).then(function(bounties) {
      // build stats map for summary table; NB: possibly faster on the backend
      $scope.stats_map = {};

      var claimed_bounties = [];
      var open_bounties = [];
      var total_paid_out = 0;
      var total_spent = 0;
      var total_open = 0;
      for (var i=0; i<bounties.length; i++) {
        var bounty = bounties[i];
        bounty.amount = parseInt(bounty.amount, 10);
        total_spent += bounty.amount;
        if (bounty.issue.paid_out) {
          claimed_bounties.push(bounty);
          total_paid_out += bounty.amount;
          incrementStats(bounty, bounty.issue.paid_out);
        } else {
          open_bounties.push(bounty);
          total_open += bounty.amount;
          incrementStats(bounty, false);
        }
      }
      //turn stats_map into array so orderBy will work
      $scope.stats = [];
      for (var key in $scope.stats_map) {
        if($scope.stats_map.hasOwnProperty(key)) {
          $scope.stats.push($scope.stats_map[key]);
        }
      }

      $scope.claimed_bounties = claimed_bounties;
      $scope.open_bounties = open_bounties;
      $scope.total_paid_out = total_paid_out;
      $scope.total_spent = total_spent;
      $scope.total_open = total_open;
      $scope.bounties_resolved = true;
      console.log(open_bounties);
    });

  });
