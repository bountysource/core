'use strict';

angular.module('app')
  .controller('Navbar', function ($scope, $api) {
    $scope.setEnv = $api.setEnvironment;

    $scope.set_access_token = {
      show_modal: false,
      new_token: $api.get_access_token(),
      open: function() { this.show_modal = true; },
      close: function() { this.show_modal = false; },
      save: function() {
        $api.set_access_token(this.new_token);
        $api.load_current_person_from_cookies();
        this.close();
      }
    };
  })

  .controller('NavbarLinkedAccountSignin', function($scope, $location, $api) {
    $scope.save_route = function() {
      $api.set_post_auth_url($location.url());
    };
  });

