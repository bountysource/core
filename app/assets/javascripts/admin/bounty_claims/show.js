angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/claim/:id', {
    templateUrl: 'admin/bounty_claims/show.html',
    controller: "ClaimShow"
  });
})
.controller("ClaimShow", function ($routeParams, $scope, $window, $api) {
  $scope.form_data = {};
  $api.get_bounty_claim($routeParams.id).then(function(response) {
    if (response.meta.success) {
      var claim = response.data;
      $scope.claim = response.data;
      $scope.form_data.code_url = claim.code_url;
      $scope.form_data.description = claim.description;
      $scope.form_data.disputed = claim.disputed;
      $scope.form_data.rejected = claim.rejected;

      for (var i = 0; i < claim.events.length; i++) {
        if (claim.events[i].type === "BountyClaimEvent::BackerAccepted") {
          $scope.accepted_at = claim.events[i].created_at;
        }
      }

    } else {
      return response.data.error;
    }
  });

  $scope.resetPage = function() {
    $window.location.reload();
  };

  $scope.updateClaim = function(claim, form_data) {
    $api.update_claim(claim.id, form_data).then(function(response) {
      if (response.meta.success) {
        $window.location.reload();
      } else {
        $scope.error = response.data.error;
      }
    });
  };

  $scope.checkNull = function(obj) {
    return obj === null
  }

  $scope.forceCollect = function(claim) {
    if(confirm("Are you sure? This operation is irreversible")){
      $api.force_collect_claim(claim.id).then(function(response){
        if(response.meta.success) {
          $window.location.reload();
        } else {
          $scope.error = response.data.error;
        }
      })
    }
  }

});
