'use strict';

angular.module('app')
  .controller('MainController', function ($scope, $location, $rootScope, $window) {
    $rootScope.$on('$viewContentLoaded', function() {
      $scope.no_container = $location.path() === '/';
    });

    $rootScope.setPageTitle = function() {
      var value = arguments.length > 0 ? Array.prototype.slice.call(arguments,0) : arguments[0];
      var parts;
      if ((value === null) || (value === undefined) || (value === false)) {
        // no page title, do nothing
        parts = [ 'Bountysource' ];
      } else if (typeof(value) === 'string') {
        // string page title, append
        parts = [ value ];
      } else {
        // array page title, slice
        parts = value.slice(0);
      }
      $window.document.title = parts.join(' - ');
    };

    $rootScope.setTargetBlank = function() {
      var allDivs = document.querySelectorAll('div[target-blank]');
      for(var i = 0; i < allDivs.length; i++) {
        var allLinks = allDivs[i].querySelectorAll('a');
        for(var j = 0; j < allLinks.length; j++) {
          allLinks[j].target = '_blank';
        }
      }
    }

    // change page title on change route
    $rootScope.$on('$routeChangeStart', function (event, current) {
      if (!current.$$route) {
        $rootScope.setPageTitle('Page Not Found');
      } else if (current.$$route.title) {
        $rootScope.setPageTitle(current.$$route.title);
      } else {
        $rootScope.setPageTitle();
      }
    });

  });
