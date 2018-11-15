angular.module('directives').directive('infoSpace', function() {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    templateUrl: 'common/directives/infoSpace/infoSpace.html',
    scope: {
      infoSpace: "="
    }
  };
});
