angular.module('directives').directive('profileName', function ($api) {
  return {
    restrict: "E",
    templateUrl: "common/directives/profileName/profileName.html",
    replace: true,
    scope: {
      owner: '='
    },
    link: function (scope) {
      scope.$watch('owner', function () {
        // resolve owner or default to anonymous
        scope.local_owner = scope.owner || $api.anonymous_owner_hash();

        // resolve link to an href
        scope.href = $api.owner_to_href(scope.local_owner);

        scope.owner_display_name = scope.local_owner.display_name;
      });
    }
  };
});
