angular.module('directives').directive('onFinishRender', function() {
  return {
    restrict: "A",
    link: function (scope, element, attr) {
      if (scope.$last === true) {
        scope.$evalAsync(attr.onFinishRender);
      }
    }
  };
});
