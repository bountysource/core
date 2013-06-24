'use strict';

angular.module('app')
  .controller('PersonTabs', function($scope, $location, $routeParams) {
    $scope.tabs = [
      { name: 'Activity', url: '/people/' + $routeParams.id }
      //{ name: 'Following', url: '/people/' + $routeParams.id + '/following' }
    ];
    $scope.is_active = function(url) {
      return url === $location.path();
    };

  });
