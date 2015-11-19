angular.module('directives').directive('nameForExternalLink', function() {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'common/directives/nameForExternalLink/nameForExternalLink.html',
    scope: {
      objectType: "="
    },
    link: function(scope, elm, attrs, ctrl) {
      scope.$watch('objectType', function() {
        if (!scope.objectType) {
          scope.text = "";
        } else if (scope.objectType.match(/^github::/i)) {
          scope.text = 'GitHub';
        } else if (scope.objectType.match(/^jira::/i)) {
          scope.text = 'Jira';
        } else if (scope.objectType.match(/^bitbucket::/i)) {
          scope.text = 'BitBucket';
        } else if (scope.objectType.match(/^launchpad::/i)) {
          scope.text = 'Launchpad';
        } else if (scope.objectType.match(/^sourceforge(native)?::/i)) {
          scope.text = 'SourceForge';
        } else if (scope.objectType.match(/^trac::/i)) {
          scope.text = 'Trac';
        } else if (scope.objectType.match(/^pivotal::/i)) {
          scope.text = 'Pivotal';
        } else if (scope.objectType.match(/^bugzilla::/i)) {
          scope.text = 'Bugzilla';
        } else {
          scope.text = "External Site";
        }
      });
    }
  };
});
