angular.module('app')
  .controller('MainController', function ($scope, $location, $rootScope, $window, $pageTitle) {
    $rootScope.$on('$viewContentLoaded', function() {
      $scope.no_container = $location.path() === '/';
    });

    // change page title on change route
    $rootScope.$on('$routeChangeStart', function (event, current) {
      if (!current.$$route) {
        $pageTitle.set('Page Not Found');
      } else if (current.$$route.title) {
        $pageTitle.set(current.$$route.title);
      } else {
        $pageTitle.set();
      }
    });

  });
