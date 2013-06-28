'use strict';

angular.module('app').
  filter('percent', function () {
    return function (input) {
      return Math.round(100 * input) + '%';
    };
  }).filter('dollars', function ($filter) {
    var currency = $filter('currency');
    return function(input) {
      return currency(input, '$').replace(/\.\d\d$/,'');
    };
  }).filter('round', function () {
    return function (input) {
      return Math.round(input);
    };
  }).filter('at_least', function () {
    return function (input, other) {
      return (input > other) ? input : other;
    };
  }).filter('at_most', function () {
    return function (input, other) {
      return (input < other) ? input : other;
    };
  }).filter('truncate', function() {
    // truncate string, add '...' or custom text.
    // note, size is the EXACT length of the string returned,
    // which factors in the length of replacement.
    //
    // $scope.text = "Apples are delicious"
    // <span>{{ text | truncate:12 }}</span> ==> <span>Apples ar...</span>
    return function(s, size, replacement) {
      size = size || 50;
      replacement = replacement || "...";
      if (!s || s.length <= (size + replacement.length)) return s;
      return s.slice(0,size+replacement.length) + replacement;
    };
  }).filter('from_snake_case', function() {
    // Convert snakecase to words
    return function(s) {
      var parts = s.replace(/[_-]/g, " ").split(" ");
      var new_parts = [];
      for (var i=0; i<parts.length; i++) { new_parts.push(parts[i][0] + parts[i].slice(1)); }
      return new_parts.join(" ");
    };
  }).filter('title', function() {
    // Capitalize all words
    return function(s) {
      var parts = s.split(" ");
      var new_parts = [];
      for (var i=0; i<parts.length; i++) { new_parts.push(parts[i][0].toUpperCase() + parts[i].slice(1)); }
      return new_parts.join(" ");
    };
  }).filter('solution_status', function() {
    return function(solution) {
      if (!solution) { return ""; }
      if (!solution.submitted) { return 'started'; }
      else if (solution.submitted && !solution.merged) { return 'pending_merge'; }
      else if (solution.in_dispute_period && !solution.disputed && !solution.accepted) { return 'in_dispute_period'; }
      else if (solution.disputed) { return 'disputed'; }
      else if (solution.rejected) { return 'rejected'; }
      else if (solution.accepted && !solution.paid_out) { return 'accepted'; }
      else if (solution.accepted && solution.paid_out) { return 'paid_out'; }
      else { return ""; }
    };
  }).filter('solution_progress_description', function($filter) {
    var get_status = $filter('solution_status');
    return function(solution) {
      var status = get_status(solution);
      if (status === "started") { return "You have started working on a solution."; }
      else if (status === "pending_merge") { return "Your solution has been submitted. Waiting for the issue to be resolved"; }
      else if (status === "in_dispute_period") { return "The issue has been resolved, and your solution is in the dispute period."; }
      else if (status === "disputed") { return "Your solution has been disputed."; }
      else if (status === "rejected") { return "Your solution has been rejected."; }
      else if (status === "paid_out") { return "You have claimed the bounty for this issue."; }
      else if (status === "accepted") { return "Your solution has been accepted!"; }
      else { return ""; }
    };
  });

