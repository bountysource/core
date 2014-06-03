'use strict';

angular.module('directives').directive('issueActionBanner', function () {
  return {
    restrict: 'EA',
    templateUrl: 'common/directives/issueActionBanner/templates/issueActionBanner.html',
    replace: true,
    link: function (scope, element, attributes) {
      // placeholder
    }
  };
});
