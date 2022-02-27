angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/issues/:id', {
    templateUrl: 'admin/issues/show.html',
    controller: "IssuesShow"
  });
})
.controller("IssuesShow", function ($routeParams, $scope, $window, $api) {
  $scope.form_data = {};

  $api.get_issue($routeParams.id).then(function(response) {

    if (response.meta.success) {
      $scope.issue = response.data;
      $scope.form_data.featured = response.data.featured;
      $scope.form_data.closed = !response.data.can_add_bounty;
      $scope.backers = [];
      for (var i = 0; i < response.data.bounties.length; i++) {
        $scope.backers.push(response.data.bounties[i].person);
      }
    } else {
      $scope.error = response.data.error;
    }
  });

  $scope.refundBounties = function() {
    if (confirm("Are you sure?")) {
      angular.forEach($scope.issue.bounties, function(bounty) {
        if (bounty.checked && (bounty.status==='active')) {
          $api.refund_bounty(bounty.id, false).then(function(response) {
            if (response.meta.success) {
              angular.forEach($scope.issue.bounties, function(sub_bounty, $index) {
                if (sub_bounty.id === bounty.id) {
                  $scope.issue.bounties[$index] = response.data;
                }
              });
            } else {
              alert(response.data.error);
            }
          });
        }
      });
    }
  };

  $scope.moveBounties = function() {
    if (confirm("Are you sure?")) {
      angular.forEach($scope.issue.bounties, function(bounty) {
        if (bounty.checked && (bounty.status==='active')) {
          $api.move_bounty(parseInt($scope.move_bounties_to_issue_id), bounty.id).then(function(response) {
            if (response.meta.success) {
              angular.forEach($scope.issue.bounties, function(sub_bounty, $index) {
                if (sub_bounty.id === bounty.id) {
                  response.data.status='moved';
                  $scope.issue.bounties[$index] = response.data;
                }
              });
            } else {
              alert(response.data.error);
            }
          });
        }
      });
    }
  };

  $scope.update_issue = function(issue, data) {
    $api.update_issue(issue.id, data).then(function(response) {
      if (response.meta.success) {
        $scope.saved_at = new Date();
      } else {
        $scope.error = response.data.error;
      }
    });
  };

  $scope.checkboxToggle = function(bounty) {
    bounty.checked = !bounty.checked;
  };

  $scope.checkboxToggleAll = function() {
    $scope.checkbox_toggled = !$scope.checkbox_toggled;
    angular.forEach($scope.issue.bounties, function(bounty) {
      bounty.checked = $scope.checkbox_toggled;
    });
  };

  $scope.refundCount = function() {
    return 0;
  };

});
