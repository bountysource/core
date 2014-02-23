'use strict';

angular.module('directives').directive('ngClickRequireAuth', function($parse, $api) {
  return {
    restrict: "A",
    link: function(scope, element, attr) {
      var action = $parse(attr.ngClickRequireAuth);
      element.bind('click', function(event) {
        scope.$apply(function() {
          if (scope.current_person) {
            action(scope, {$event: event});
          } else {
            // if it has an href attribute, save that as the postauth URL
            var url = element.attr('href');
            element.removeAttr('href');
            element.removeAttr('ng-href'); // don't know if this actually has to be removed. oh well.
            $api.require_signin(url);
          }
        });
      });
    }
  };
});