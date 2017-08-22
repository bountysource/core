angular.module('directives')
.directive('taxFormFocus', function($timeout) {
  return {
    restrict: "A",
    link: function(scope, elem) {
      scope.$on('focusOn', function (e, name) {
        // The timeout lets the digest / DOM cycle run before attempting to set focus
        $timeout(function () {
          var input = angular.element(elem[0].querySelector('[name="' + name + '"]'));
          if(input[0]) {
            input[0].focus();
          }
        }, 50);
      })
    }
  }
});

