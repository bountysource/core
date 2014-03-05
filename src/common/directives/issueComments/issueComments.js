'use strict';

angular.module('directives').directive('issueComments', function() {

  return {
    restrict: 'EAC',
    scope: {
      comments: '='
    },
    templateUrl: 'common/directives/issueComments/templates/issueComments.html'
  };

});