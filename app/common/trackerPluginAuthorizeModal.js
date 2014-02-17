'use strict';

angular.module('app').run(function($rootScope, $routeParams, $window, $location, $modal) {

  var paramKeyName = 'authorize';

  var testRouteParams = function(){
    return $window.parseInt($routeParams[paramKeyName], 10) === 1;
  };

  var routeChangeListener = $rootScope.$on('$routeChangeSuccess', function() {
    if (testRouteParams()) {
      // Unregister route change listener
      routeChangeListener();

      console.log($routeParams, testRouteParams());

      $location.search(paramKeyName, null);

      $modal.open({
        templateUrl: 'common/templates/trackerPluginAuthorizeModal.html',
        backdrop: true,
        controller: function($scope, $location, $window, $q, $api, $modalInstance) {

          // Save the current URL and go through GitHub oauth to collect the public_repo permission.
          $scope.performOauthDance = function() {
            $api.set_post_auth_url($location.url());
            $window.location = $api.signin_url_for('github', { scope: 'public_repo' });
          };

          $scope.closeModal = function() {
            $modalInstance.close();
          };
        }
      });
    }
  });
});
