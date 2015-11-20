angular.module('app').controller("NavbarController", function ($scope, $auth) {
  $scope.logout = $auth.logout;
});
