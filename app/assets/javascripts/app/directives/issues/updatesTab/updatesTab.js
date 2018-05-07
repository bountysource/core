angular.module('directives').directive('updatesTab', function ($rootScope, $routeParams, $api, Issue, Bounties) {
  return {
    restrict: 'EAC',
    replace: true,
    transclude: true,
    templateUrl: 'app/directives/issues/updatesTab/updatesTab.html',
    controller: 'IssueDevelopersController'
  };
});
