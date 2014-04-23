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

}).directive('onFinishRender', function($timeout) {

  return {
    restrict: "A",
    link: function (scope, element, attr) {

      if (scope.$last === true) {
        $timeout(function() {
          scope.$emit('ngRepeatFinished');
        });
      }
      
    }
  };
});

