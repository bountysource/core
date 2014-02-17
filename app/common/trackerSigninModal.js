'use strict';

angular.module('app').run(function($rootScope, $routeParams, $window, $location, $api, $modal) {

  var paramKeyName = 'signin';

  var testRouteParams = function(){
    return $window.parseInt($routeParams[paramKeyName], 10) === 1;
  };

  var routeChangeListener = $rootScope.$on('$routeChangeSuccess', function() {

    if (testRouteParams()) {
      // Unregister route change listener
      routeChangeListener();

      var currrentPersonWatcher = $rootScope.$watch('current_person', function(person) {
        if (person === false) {
          $location.search(paramKeyName, null);

          // Load Tracker from routeParams
          $api.tracker_get($routeParams.id).then(function(tracker) {
            $modal.open({
              templateUrl: 'common/templates/trackerSigninModal.html',
              backdrop: true,
              controller: function($scope, $api, $location, $window, $modalInstance) {
                $scope.tracker = tracker;

                $scope.closeModal = function() {
                  $modalInstance.close();
                };

                $scope.signin = function() {
                  $api.set_post_auth_url($location.path());

                  // Pull tracker ID from route. Gets passed through github auth.
                  var followTrackerIds = [$routeParams.id];

                  $window.location = $api.signin_url_for('github', { follow_tracker_ids: followTrackerIds });
                };
              }
            });
          });
        }

        currrentPersonWatcher();
      });
    }
  });
});
