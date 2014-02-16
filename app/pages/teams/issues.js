'use strict';

angular.module('app.controllers').controller('TeamIssuesController', function ($scope, $routeParams, $api) {
  $scope.issues_resolved = false;

  $scope.issue_sort = {
    column: "participants_count",
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

  $api.team_issues($routeParams.id).then(function(issues) {
    for (var i in issues) {
      // sorting doesn't like nulls.. this is a quick hack
      issues[i].participants_count = issues[i].participants_count || 0;
      issues[i].thumbs_up_count = issues[i].thumbs_up_count || 0;
      issues[i].comment_count = issues[i].comment_count || 0;
    }
    $scope.issues = issues;
    $scope.issues_resolved = true;
  });
});
