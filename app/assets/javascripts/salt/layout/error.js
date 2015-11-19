angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.error', {
    templateUrl: "salt/layout/error.html",
    params: {
      code: '@code',
      message: '@message'
    },
    controller: function($scope, $stateParams) {
      $scope.code = $stateParams.code;
      $scope.message = $stateParams.message;
    }
  });
});
