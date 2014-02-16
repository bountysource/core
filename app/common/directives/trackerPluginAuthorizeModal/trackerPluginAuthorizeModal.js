'use strict';

angular.module('bountysource.directives').directive('trackerPluginAuthorizeModal', function($routeParams, $window, $location, $api) {
  return {
    templateUrl: 'common/directives/trackerPluginAuthorizeModal/templates/trackerPluginAuthorizeModal.html',
    scope: true,
    link: function(scope) {
      scope.paramName = 'authorize';

      scope.$$showModal = $window.parseInt($routeParams[scope.paramName], 10) === 1;

      scope.closeModal = function() {
        scope.$$showModal = false;
      };

      $location.search(scope.paramName, null);

      // Save the current URL and go through GitHub oauth to collect the public_repo permission.
      scope.performOauthDance = function() {
        $api.set_post_auth_url($location.url());
        $window.location = $api.signin_url_for('github', { scope: 'public_repo' });
      };
    }
  };
});