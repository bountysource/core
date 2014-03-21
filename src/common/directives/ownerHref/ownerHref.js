'use strict';

angular.module('directives').directive('ownerHref', function() {
  return {
    restrict: "AC",
    link: function(scope, element, attr) {
      scope.$watch(attr.ownerHref, function(owner) {
        if (owner) {
          if ((/^person$/i).test(owner.type)) {
            element.attr("href", "/people/"+owner.slug);
          } else if ((/^team(?:::[a-z]+)*$/i).test(owner.type)) {
            element.attr("href", "/teams/"+owner.slug);
          } else if ((/^(?:repository|tracker)(?:::[a-z]+)*$/i).test(owner.type)) {
            element.attr("href", "/trackers/"+owner.id);
          }
        }
      });
    }
  };
});