'use strict';

angular.module('bountysource.directives').directive('issuesList', function() {
  return {
    restrict: "E",
    templateUrl: "pages/issues/partials/issues_list.html",
    replace: true,
    scope: {
      issues: "=",

      // Optional columns to include
      include: "="
    },
    link: function(scope) {
      // Default sort order to participant count descending.
      scope.$orderData = {
        column: "participants_count",
        reverse: true
      };

      /*
       * Change the sort order of the table.
       * Change direction if already sorting by column.
       * NOTE: Can only sort by one column at a time for now.
       * */
      scope.$changeSortOrder = function(column) {
        if (scope.$orderData.column === column) {
          scope.$orderData.reverse = !scope.$orderData.reverse;
        } else {
          scope.$orderData.column = column;
          scope.$orderData.reverse = true;
        }
      };

      scope.$showTrackerImage = false;
      scope.$showTrackerName = false;
      scope.$showIssueTitle = true;
      scope.$showBountyTotal = false;
      scope.$showThumbsUpCount = false;
      scope.$showParticipantsCount = false;
      scope.$showIssueAge = false;

      if (angular.isArray(scope.include)) {
        scope.$showTrackerImage = scope.include.indexOf('trackerImage') >= 0 || false;
        scope.$showTrackerName = scope.include.indexOf('trackerName') >= 0 || false;
        scope.$showBountyTotal = scope.include.indexOf('bountyTotal') >= 0 || false;
        scope.$showThumbsUpCount = scope.include.indexOf('thumbsUpCount') >= 0 || false;
        scope.$showParticipantsCount = scope.include.indexOf('participantsCount') >= 0 || false;
        scope.$showIssueAge = scope.include.indexOf('issueAge') >= 0 || false;
      }
    }
  };
});