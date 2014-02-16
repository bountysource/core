'use strict';

angular.module('bountysource.directives').directive('issueList', function() {
  return {
    restrict: "E",
    templateUrl: "common/directives/issueList/templates/issueList.html",
    replace: true,
    scope: {
      issues: "=",
      options: "="
    },
    link: function(scope, element, attributes) {
      if (scope.options && scope.options.sort && scope.options.desc) {
        scope.issue_sort = { "column": scope.options.sort, "desc": scope.options.desc };
      } else if (scope.options && scope.options.sort) {
        scope.issue_sort = { "column": scope.options.sort, "desc": true };
      } else {
        scope.issue_sort = { "column": "participants_count", "desc": true };
      }
      scope.issue_sorter = function(obj) {
        return obj[scope.issue_sort.column] || 0;
      };
      scope.update_sort = function(obj, column) {
        if (obj.column === column) {
          obj.desc = !obj.desc;
        } else {
          obj.column = column;
          obj.desc = true;
        }
      };
      scope.column = {};
      scope.has_column = function(col_name) {
        if (scope.column[col_name]) {
          return true;
        } else {
          return false;
        }
      };
      scope.$watch('issues', function() {
        if (scope.issues && scope.issues.length > 0) {
          scope.column = {};
          for (var i=0; i<scope.issues.length; i++) {
            for (var key in scope.issues[i]) {
              scope.column[key] = true;
            }
          }
        }
      });
    }
  };
});