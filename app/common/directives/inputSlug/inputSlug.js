'use strict';

angular.module('bountysource.directives').directive('inputSlug', ['$filter', function($filter) {
  return {
    restrict: "AC",
    require: "ngModel",
    link: function(scope, element, attrs, ctrl) {
      var slugify = function(viewValue) {
        var slugifiedViewValue = $filter('slug')(viewValue);
        if (slugifiedViewValue !== viewValue) {
          ctrl.$setViewValue(slugifiedViewValue);
          ctrl.$render();
        }
        return slugifiedViewValue;
      };
      ctrl.$parsers.push(slugify);
      slugify(scope[attrs.ngModel]); // initial value
    }
  };
}]);