'use strict';

angular.module('app.directives').directive('trackerSigninModal', ['$rootScope', '$routeParams', '$window', '$location', '$api', function($rootScope, $routeParams, $window, $location, $api) {
  return {
    restrict: 'E',
    templateUrl: 'common/directives/trackerSigninModal/templates/trackerSigninModal.html',
    scope: {
      tracker: '='
    },
    link: function(scope) {
      scope.paramName = 'signin';

      $rootScope.$watch('current_person', function(person) {
        scope.$$showModal = ($window.parseInt($routeParams.signin, 10) === 1) && person === false;

        scope.openModal = function() {
          scope.$$showModal = true;
        };

        scope.closeModal = function() {
          scope.$$showModal = false;
        };

        scope.signin = function() {
          $api.set_post_auth_url($location.path());
          $window.location = $api.signin_url_for('github', { follow_tracker_ids: [scope.tracker.id] });
        };

        $location.search(scope.paramName, null);
      });
    }
  };
}]);