'use strict';

angular.module('app')
  .controller('Navbar', function ($scope, $api) {
    $scope.setEnv = $api.setEnvironment;
  })
  .controller('NavbarLinkedAccountSignin', function($scope, $location, $api) {
    $scope.save_route = function() {
      $api.set_post_auth_url($location.url());
    };
  });

