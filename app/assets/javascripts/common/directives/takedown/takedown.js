angular.module('directives').directive('takedown', function ($window) {
  return {
    restrict: 'E',
    templateUrl: 'common/directives/takedown/takedown.html',
    replace: true
  };
});
