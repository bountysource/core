'use strict';

angular.module('app').controller('StaticPageController', function ($scope, $location, $anchorScroll, $routeParams) {
  // Inherit this for static pages that need deep-linking of hash fragments!

  var hash = $location.hash();

  if (hash.length > 0) {
    $location.hash(hash.replace(/^\/+/, '')); $anchorScroll();
  }

  return true;
});
