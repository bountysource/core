'use strict';

angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/bounties/:id', {
    templateUrl: 'admin/bounties/show.html',
    controller: "BountiesShow"
  });
})
.controller("BountiesShow", function ($routeParams, $scope, $window, $api) {
  $api.get_bounty($routeParams.id).then(function(response) {
    if (response.meta.success) {
      $scope.bounty = response.data;
      $scope.splits = response.data.splits;

      if ($scope.bounty.anonymous) {
        $scope.form_owner = { owner_type: 'Anonymous' };
      } else if ($scope.bounty.owner_type) {
        $scope.form_owner = {
          owner_type: $scope.bounty.owner_type,
          owner_id: $scope.bounty.owner_id
        };
      } else {
        $scope.form_owner = {
          owner_type: 'Person',
          owner_id: $scope.bounty.person.id
        };
      }

    } else {
      $scope.error = response.data.error;
    }
  });

  $scope.update_owner = function() {
    var post_data = {};
    if ($scope.form_owner.owner_type === 'Anonymous') {
      post_data = { anonymous: true };
    } else {
      post_data = { anonymous: false, owner_type: $scope.form_owner.owner_type, owner_id: $scope.form_owner.owner_id };
    }
    console.log(post_data);
    $api.update_bounty($scope.bounty.id, post_data).then(function() {
      $window.location.reload();
    });
  };

  $scope.audited = function(split) {
    return split.transaction.audited;
  };

  $scope.refund = function(bounty_id) {
    if (confirm("Are you sure?")) {
      $api.refund_bounty(bounty_id).then(function(response) {
        if (response.meta.success) {
          $window.location.reload();
        } else {
          alert(response.data.error);
        }
      });
    }
  };

  $scope.set_featured = function(bounty_id, featured) {
    $api.update_bounty(bounty_id, { featured: featured }).then(function(response) {
      if (response.meta.success) {
        $scope.bounty = response.data;
      } else {
        alert(response.data.error);
      }
    });
  };


    $scope.memo = function(split) {
    if (split.transaction.description !== split.memo) {
      return split.memo;
    } else {
      return '';
    }
  };

});
