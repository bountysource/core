// dependencies
angular.module('app',[
  'templates',
  'ui.router',
  'ui.bootstrap',
  'ngResource',
  'ngCookieJar',
  'filters',
  'angular-loading-bar',
  'btford.markdown',
  'monospaced.elastic'
]);

angular.module('filters',[]);

// // allow ng-view within ng-include's (http://stackoverflow.com/questions/16674279/how-to-nest-ng-view-inside-ng-include)
// angular.module('app').run(['$route', angular.noop]);
angular.module('app').config(function($urlRouterProvider, $locationProvider) {
  // not found
  $urlRouterProvider.otherwise(function($injector){
    $injector.invoke(['$state', function($state) {
      $state.transitionTo('root.error', { code: 404, message: 'Route Not Found' });
    }]);
  });

  // browser pushState rather than /#/hash/urls
  $locationProvider.html5Mode(true);

}).run(function($anchorScroll, $window, $rootScope, $state) {
  // error pages
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    event.preventDefault();
    $state.transitionTo('root.error', {
      code: error.status || 500,
      message: (error.data && error.data.error) || error.statusText || 'Server Error'
    });
  });

  // hack to scroll to top when navigating to new URLS but not back/forward
  var wrap = function(method) {
    var orig = $window.window.history[method];
    $window.window.history[method] = function() {
      var retval = orig.apply(this, Array.prototype.slice.call(arguments));
      $anchorScroll();
      return retval;
    };
  };
  wrap('pushState');
  wrap('replaceState');
});
