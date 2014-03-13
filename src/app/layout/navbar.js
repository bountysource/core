'use strict';

angular.module('app').controller('NavbarController', function ($scope, $api, $modal) {
  $scope.$watch('current_person', function(current_person) {
    if (current_person) {
      $api.person_teams(current_person.id).then(function(teams) {
        $scope.teams = teams;
      });
    }
  });

  $scope.setEnv = $api.setEnvironment;

  $scope.signout = function() {
    $api.signout();
  };

  $scope.openDevToolsModal = function() {
    $modal.open({
      templateUrl: 'app/layout/templates/devToolsModal.html',
      controller: function($scope, $api, $modalInstance) {

        $scope.data = {
          access_token: $api.get_access_token()
        };

        // Apply changes
        $scope.apply = function() {
          $api.set_access_token($scope.data.access_token);
          $api.load_current_person_from_cookies();

          this.close();
        };

        $scope.close = function() {
          $modalInstance.close();
        };

      }
    });
  };
});

angular.module('app').controller('AlertNotificationBar', function ($scope, $location) {
  $scope.$on('$routeChangeSuccess', function() {
    $scope.show_alert_notification_bar = !$location.path().match(/^(\/|\/fundraisers\/.*)$/);
  });
});

angular.module('app').controller('NavbarLinkedAccountSignin', function($scope, $location, $api) {
  $scope.save_route = function() {
    $api.set_post_auth_url($location.url());
  };

  $scope.send_to_email_login = function() {
    $scope.save_route();
    $location.url("/signin");
  };
});
