angular.module('directives').directive('backersTab', function ($rootScope, $routeParams, $api, Issue, Bounties) {
  return {
    restrict: 'EAC',
    replace: true,
    transclude: true,
    templateUrl: 'app/directives/issues/backersTab/backersTab.html',
    link: function(scope) {
      scope.bounties = Bounties.get({
        issue_id: $routeParams.id,
        include_owner: true,
        order: '+amount'
      });

      // allow sorting
    scope.crypto_sort_column = 'created_at';
      scope.sort_column = 'amount';
      scope.sort_reverse = true;
      scope.sort_by = function(col) {
        // if clicking this column again, then reverse the direction.
        if (scope.sort_column === col) {
          scope.sort_reverse = !scope.sort_reverse;
        } else {
          scope.sort_column = col;
        }
      };
    }
  };
});
