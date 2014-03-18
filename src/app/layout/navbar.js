'use strict';

angular.module('app').controller('NavbarController', function ($scope, $api, $modal, $window, $cookieStore) {
  $scope.$watch('current_person', function(current_person) {
    if (current_person) {
      $api.person_teams(current_person.id).then(function(teams) {
        $scope.teams = teams;
      });
    }
  });

  $scope.setEnv = function(value) {
    $cookieStore.put('api_environment', value);
    $window.location.reload();
  };

  $scope.signout = function() {
    $api.signout();
  };

  $scope.openDevToolsModal = function() {
    $modal.open({
      templateUrl: 'app/layout/templates/devToolsModal.html',
      controller: function($scope, $api, $cookieStore, $modalInstance) {

        $scope.cookieName = 'devToolsData';

        $scope.data = $cookieStore.get($scope.cookieName) || {
          identities: [],
          activeIndex: undefined
        };

        $scope.close = function() {
          $modalInstance.close();
        };

        $scope.newIdentity = {
          name: undefined,
          access_token: undefined
        };

        $scope.addIdentity = function(identity) {
          for (var i=0; i<$scope.data.identities.length; i++) {
            if ($scope.data.identities[i].access_token === identity.access_token) {
              return;
            }
          }
          $scope.data.identities.push(angular.copy(identity));
          $scope.newIdentity = { name: undefined, access_token: undefined };
          $cookieStore.put($scope.cookieName, $scope.data);
        };

        $scope.removeIdentity = function(index) {
          $scope.data.identities.splice(index,1);
          $cookieStore.put($scope.cookieName, $scope.data);
        };

        $scope.getActiveIdentity = function() {
          if (angular.isDefined($scope.data.activeIndex)) {
            return $scope.data.identities[$scope.data.activeIndex];
          }
        };

        $scope.setActiveIdentity = function(index) {
          if (angular.isNumber(index)) {
            $scope.data.activeIndex = index;
            $api.set_access_token($scope.data.identities[index].access_token);
            $api.load_current_person_from_cookies();
            $cookieStore.put($scope.cookieName, $scope.data);
          }
        };

        // Add currently logged in person
        var token = $api.get_access_token();
        if (token) {
          $scope.$watch('current_person', function(person) {
            $scope.addIdentity({
              name: person.display_name,
              access_token: token
            });
          });
        }
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
