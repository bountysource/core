'use strict';

angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/issues/unpaid', {
    templateUrl: 'admin/issues/closed.html',
    controller: "IssuesClosedController"
  });
})
.controller("IssuesClosedController", function ($scope, $window, $api) {
  // NOTE ABOUT ROUTING
  // Because of routing priority, these files are named "closed.js/html"
  // Show.js has: "/issues/:id" which eats up "/issues/unpaid"
  // This is because "unpaid.js/html" woul be loaded after "show.js"

  //set initial ordering of data
  $scope.column = "earliest_bounty_created_at";
  $scope.reverse = true;
  $scope.working = true;
  $api.get_closed_issues().then(function (response) {
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
