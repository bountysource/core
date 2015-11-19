'use strict';

angular.module('directives').directive('abRandomize', function ($rootScope, $compile) {
  return {
    restrict: "AC",
    link: function (scope, element, attrs) {
      $rootScope.$on("$load_expiration_options", function () {
        var radio_array = element[0].children;
        var children_array = [];
        for (var i = 0; i < radio_array.length; i++) {
          children_array.push(radio_array[i]);
        }
        children_array = children_array.sort(function() {return 0.5 - Math.random();});
        element.children().remove();
        element.append(children_array);
        $compile(element.contents())(scope);
      });
    }
  };
});