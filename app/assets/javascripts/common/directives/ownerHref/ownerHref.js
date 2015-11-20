angular.module('directives').directive('ownerHref', function($api) {
  return {
    restrict: "AC",
    link: function(scope, element, attr) {
      scope.$watch(attr.ownerHref, function(owner) {
        var href = $api.owner_to_href(owner);
        if (href) {
          element.attr("href", href);
        } else {
          element.addClass("unstyled-anchor");
        }
      });
    }
  };
});
