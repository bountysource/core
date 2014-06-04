'use strict';

angular.module('directives').directive('issueActionBanner', function () {
  return {
    restrict: 'EA',
    templateUrl: 'common/directives/issueActionBanner/templates/issueActionBanner.html',
    replace: true,
    link: function (scope, element, attributes) {

      scope.resolved = null;

      // Probably bad design if i need to do this... Refactor
      var resolvedRenderable = function () {
        return (scope.canManageIssue !== null) && scope.requestForProposal.$resolved;
      };

      // Used to render the call-to-action box only when important variables have been populated
      scope.$watch(resolvedRenderable, function (result) {
        if (result) {
          scope.resolved = true;
        }
      });

      /**
       * Request for proposal has been resolved and is a saved records
       * */
      scope.requestForProposalExists = function () {
        return scope.requestForProposal.$resolved && scope.requestForProposal.saved();
      };

    }
  };
});
