angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/issue_addresses/:id', {
    templateUrl: 'admin/issue_addresses/show.html',
    controller: "IssueAddressesShow"
  });
})
.controller("IssueAddressesShow", function ($routeParams, $scope, $api, $window) {
  $scope.refund = { fee_percent: 5 }

  $api.call('/admin/issue_addresses/' + $routeParams.id, function(response) {
    $scope.issueAddress = angular.copy(response.data);
  });

  $scope.processRefund = function(refund){
    $scope.feedbackMessage = 'Processing';
    if(!$scope.form_data.$valid){
      $scope.form_data.transaction_hash.$dirty = true;
      $scope.form_data.reason.$dirty = true;
      $scope.form_data.fee_percent.$dirty = true;
    } else {
      var params = angular.copy(refund);
      params.issue_id = $scope.issueAddress.issue.id;
      $api.call('/admin/ethereum_transaction_refunds', 'POST', params, function(response) {
        $scope.feedbackMessage = 'Refunded';
        $scope.form_data = {};
        $scope.form_data.fee_percent = 5;
        $scope.issueAddress = angular.copy(response.data);
      });  
    }
  };
});
