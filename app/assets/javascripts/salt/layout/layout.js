angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root', {
    parent: 'auth',
    abstract: true,
    templateUrl: 'salt/layout/layout.html',
    controller: function($scope, $state) {
      $scope.state = $state;
    }
  });
}).run(function($rootScope) {
  // lets you set "container: false" on a scope to go full-width in bootstrap template
  var containerFunc = function(event, toState, toParams, fromState, fromParams) {
    if (typeof(toState.body_class) === 'string') {
      $rootScope.body_class = toState.body_class;
    } else {
      $rootScope.body_class = '';
    }

    if (toState.container === false) {
      $rootScope.container = false;
    } else {
      $rootScope.container = true;
    }

    if (toState.nav_container === false) {
      $rootScope.nav_container = false;
    } else {
      $rootScope.nav_container = true;
    }

  };
  $rootScope.$on('$stateChangeSuccess', containerFunc);
  $rootScope.$on('$stateChangeError', containerFunc);
});
