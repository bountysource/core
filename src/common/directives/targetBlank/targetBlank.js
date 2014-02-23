'use strict';

angular.module('directives').directive('targetBlank', function() {
  return {
    restrict: "E",
    link: function($scope, element) {
      var modelName = element.attr('model');
      $scope.$watch(modelName, function(model) {
        if (model !== null) {
          setTimeout(function() {
            element.find('a').attr('target', '_blank');
          }, 0);
        }
      });
    }
  };
});