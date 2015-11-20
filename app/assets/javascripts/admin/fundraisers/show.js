angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/fundraisers/:id', {
    templateUrl: 'admin/fundraisers/show.html',
    controller: "FundraiserShow"
  });
})
.controller("FundraiserShow", function ($routeParams, $scope, $window, $api) {
  $scope.form_data = {};
  $api.get_fundraiser($routeParams.id).then(function(response) {
    if (response.meta.success) {
      $scope.fundraiser = response.data;
      $scope.form_data.published = response.data.published;
      $scope.form_data.featured = response.data.featured;
      $scope.form_data.hidden = response.data.hidden;
      $scope.percent_pledged = Math.round(response.data.total_pledged / response.data.funding_goal * 100);
    } else {
      $scope.error = response.data.error;
    }
  });

  $api.get_fundraiser_trackers($routeParams.id).then(function (response) {
    $scope.working = true;

    if (response.meta.success) {
      $scope.trackers = response.data;
      $scope.errors = false;
      $scope.working = false;
    } else {
      $scope.working = false;
      $scope.errors = response.data.errors;
    }
  });

  $scope.addTracker = function () {
    $scope.working = true;
    $api.add_fundraiser_tracker($routeParams.id, $scope.new_tracker_id).then(function (response) {
      if (response.meta.success) {
        $scope.new_tracker_id = null;
        $scope.working = false;
        $scope.errors = false;
        $scope.trackers = response.data;
      } else {
        $scope.working = false;
        $scope.errors = response.data.errors;
      }
    });
  };

  $scope.removeTracker = function (tracker_id) {
    $scope.working = true;
    $api.remove_fundraiser_tracker($routeParams.id, tracker_id).then(function (response) {
      if (response.meta.success) {
        $scope.working = false;
        $scope.errors = false;
        $scope.trackers = response.data;
      } else {
        $scope.working = false;
        $scope.errors = response.data.errors;
      }
    });
  };


  $scope.resetPage = function() {
    $window.location.reload();
  };

  $scope.updateFundraiser = function(fundraiser, form_data) {
    $api.update_fundraiser(fundraiser.id, form_data).then(function(response) {
      if (response.meta.success) {
        $window.location.reload();
      } else {
        $scope.error = response.data.error;
      }
    });
  };

  $scope.deleteFundraiser = function(fundraiser) {
    if (confirm("Are you sure you want to delete " + fundraiser.title + "?")) {
      $api.delete_fundraiser($routeParams.id).then(function(response) {
        if (response.meta.success) {
          $window.location.reload();
        } else {
          $scope.error = response.data.error;
        }
      });
    }
  };

});
