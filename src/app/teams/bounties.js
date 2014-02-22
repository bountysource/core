'use strict';

angular.module('app').controller('TeamBountiesController', function ($scope, $routeParams, $api) {
  $scope.bounties_resolved = false;

  $scope.summary_sort = {
    column: 'open',
    desc: true
  };

  $scope.open_sort = {
    column: "progress_sum",
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
        bounty = setProgressAttributes(bounty);
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
  });

  function setProgressAttributes (bounty) {
    var value_array = [],
        key,
        issue = bounty.issue;

    if(bounty.amount > 0) {
      bounty.status = "You've placed a bounty on this issue. ";
    }

    for(key in issue) {
      //loop through elements in issue
      switch(key) {
      case "developer_goals":
        if(issue.developer_goals.length > 0) {
          bounty.status += "A developer goal has been set.";
        }
        break;
      case "solutions":
        // only resonds with active solutions
        if(issue.solutions.length > 0) {
          bounty.status += "A solution is in progress. ";
        }
        break;
      case "can_add_bounty":
        if(!issue.can_add_bounty) {
          bounty.status += "The issue has been closed. ";
        }
        break;
      case "bounty_claims":
        if(issue.bounty_claims.length > 0) {
          bounty.status += "A bounty claim has been submitted. ";
        }
        break;
      }

    }
    // set attributes on the bounty object
    bounty = setBountyStatus(bounty);
    return bounty;
  }

  function setBountyStatus (bounty) {
    var final_status, final_progress, title;
    if(/claim/.test(bounty.status)) {
      title = "A developer has claimed the bounty for this issue.";
      final_status = "If you haven’t already, please vote on the claim on the Issue page.";
      final_progress = 80;
    } else if (/closed/.test(bounty.status)) {
      title = "This issue has been closed.";
      final_status = "The developer who solved this issue needs to claim the bounty.";
      final_progress = 60;
    } else if (/solution/.test(bounty.status)) {
      title = "A developer is working on a solution for this issue.";
      final_status = "You can check on the status of the solution on the Issue page.";
      final_progress = 40;
    } else if (/goal/.test(bounty.status)) {
      title = "A developer has set a bounty goal for this issue.";
      final_status = "Increase the bounty to match the developer’s bounty goal!";
      final_progress = 30;
    }
    bounty.status = final_status || "Go spread the word on Twitter, Facebook, or Google+!";
    bounty.title = title || "You have posted a bounty on this issue.";
    bounty.progress_sum = final_progress || 20;
    return bounty;
  }
});
