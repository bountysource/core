'use strict';

angular.module('directives').directive('requireGithubAuth', function($api, $window, $location) {
  // TODO support more than 1 scope
  return {
    restrict: "AC",
    link: function(scope, element, attr) {
      element.bind('click', function() {
        scope.$apply(function() {
          if (scope.current_person) {
            $api.set_post_auth_url($location.path());
            var permission = attr.requireGithubAuth;

            if (scope.current_person.github_account) {
              if (permission && scope.current_person.github_account.permissions && scope.current_person.github_account.permissions.indexOf(permission) < 0) {
                // need to redirect to get dat permission
                $window.location = $api.signin_url_for('github', { scope: [permission] });
              }
            } else {
              $window.location = $api.signin_url_for('github', { scope: [permission] });
            }
          } else {
            $api.require_signin();
          }
        });
      });
    }
  };
});