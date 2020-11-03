angular.module('app')
  .controller('Navbar', function ($location, $scope, $api) {

    $scope.signout = function() {
      $api.signout();
    };

    $scope.refresh_jobs_info = function() {
      $scope.jobs_info = $api.delayed_jobs_info();
    };

    // $scope.refresh_jobs_info();

  });
