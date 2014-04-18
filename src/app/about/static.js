'use strict';

angular.module('app').controller('StaticPageController', function ($scope, $location, $anchorScroll, $routeParams) {
  // Inherit this for static pages that need deep-linking of hash fragments!
    
  // Register as a callback on routeChangeSuccess, because app.js has a listener that takes the user to the top of the page
  var routeListener = $scope.$on('$routeChangeSuccess', function() {
    $anchorScroll();
    routeListener();
  });
});
