angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/issues/open', {
    templateUrl: 'admin/issues/open.html',
    controller: "IssuesOpenController"
  });
})
.controller("IssuesOpenController", function ($scope, $window, $api) {
  //set initial ordering of data
  $scope.column = "earliest_bounty_created_at";
  $scope.reverse = true;
  $scope.working = true;
  $api.get_open_issues().then(function (response) {
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
