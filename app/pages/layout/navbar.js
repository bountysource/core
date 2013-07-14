'use strict';

angular.module('app')
  .controller('Navbar', function ($scope, $cookieStore, $window, $api) {
    $scope.setEnv = $api.setEnvironment;

    $scope.set_access_token = {
      show_modal: false,
      new_token: null,
      open: function() {
        this.show_modal = true;
      },
      close: function() {
        this.show_modal = false;
      },
      save: function() {
        $cookieStore.put($api.access_token_cookie_name, this.new_token);
        $api.load_current_person_from_cookies();
        this.close();
      }
    };
  })

  .controller('NavbarLinkedAccountSignin', function($scope, $location, $api) {
    window.scope = $scope;

    $scope.save_route = function() {
      $api.set_post_auth_url($location.url());
    };
  });

