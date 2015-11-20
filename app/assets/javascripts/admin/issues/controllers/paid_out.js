angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/issues/paid_out', {
    templateUrl: 'admin/issues/paid_out.html',
    controller: "IssuesPaidOutController"
  });
})
.controller("IssuesPaidOutController", function ($scope, $window, $api) {

  $scope.working = true;
  $api.get_paid_out_issues().then(function (response) {
    if (response.meta.success) {
      for (var i = 0; i < response.data.length; i++) {
        response.data[i].bounty_total = parseInt(response.data[i].bounty_total, 10);
      }
      $scope.issues = response.data;
      $scope.issues_count = response.data.length;
      $scope.working = false;
    } else {
      $scope.working = false;
      $scope.error = response.data.error;
      //do something with the error  
    }
  });

});
