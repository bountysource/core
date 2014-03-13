'use strict';

angular.module('directives').directive('issueComments', function() {

  return {
    restrict: 'EAC',
    scope: {
      comments: '=',
      issue: '='
    },
    templateUrl: 'common/directives/issueComments/templates/issueComments.html'
  };

});
