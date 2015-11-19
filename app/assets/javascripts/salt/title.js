angular.module('app').run(function($rootScope) {
  // set page title
  $rootScope.$on('$stateChangeSuccess', function(event, toState) {
    $rootScope.title = toState.title;
  });
});
