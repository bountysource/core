'use strict';

angular.module('directives').directive('issueComments', function() {

  return {
    restrict: 'EAC',
    scope: {
      comments: '=',
      issue: '='
    },
    templateUrl: 'common/directives/issueComments/templates/issueComments.html',
    link: function (scope) {

      scope._ctype = 'html';

      scope.issue.$promise.then(function (issue) {
        if (issue.type === 'Bugzilla::Issue') {
          scope._ctype = 'text';
        }
      });

    }
  };

});

