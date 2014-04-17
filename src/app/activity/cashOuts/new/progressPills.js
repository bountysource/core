'use strict';

angular.module('activity').controller('ActivityCashOutProgressNavPillsController', function($scope) {

  $scope.isActive = function(index) {
    return $scope.$parent.$parent.activeTemplateIndex === index;
  };

});