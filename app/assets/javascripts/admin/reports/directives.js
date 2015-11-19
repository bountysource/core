'use strict';

angular.module('app').directive('escrowReport', [function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      report: '=',
      month: '='
    },
    templateUrl: 'admin/reports/templates/escrowReport.html'
  };
}]);

angular.module('app').directive('liabilityReport', [function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      report: '=',
      month: '='
    },
    templateUrl: 'admin/reports/templates/liabilityReport.html'
  };
}]);