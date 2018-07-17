angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/issue_addresses', {
    templateUrl: 'admin/issue_addresses/index.html',
    controller: "IssueAddresses"
  });
})
.controller("IssueAddresses", function ($scope, $api) {

  $api.call('/admin/issue_addresses', function(response) {
    $scope.issueAddresses = angular.copy(response.data);
  });
});
