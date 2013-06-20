'use strict';

angular.module('app')
  .controller('FundraisersController', function ($scope, $api, $location) {
    $scope.fundraiser.then(function(res) {
      $scope.can_manage = res.person && $scope.current_person && res.person.id === $scope.current_person.id;
      $scope.publishable = res.title && res.short_description && res.funding_goal && res.description;
      return res;
    });
  });
