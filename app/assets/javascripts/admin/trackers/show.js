angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/trackers/:id', {
    templateUrl: 'admin/trackers/show.html',
    controller: "TrackerShow"
  });
})
.controller("TrackerShow", function ($routeParams, $scope, $window, $api, $location) {
  $scope.form_data =  {};

  $api.get_tracker($routeParams.id).then(function(response) {
    if (response.meta.success) {
      var tracker = response.data;
      $scope.tracker = tracker;
      $scope.form_data.name = tracker.name;
      $scope.form_data.url = tracker.url;
      $scope.form_data.description = tracker.description;
      $scope.form_data.image_url = tracker.image_url;
      $scope.form_data.repo_url = tracker.repo_url;
      $scope.form_data.homepage = tracker.homepage;
    } else {
      $scope.error = response.data.error;
    }
  });

  $scope.resetPage = function() {
    $window.location.reload();
  };

  $scope.updateTracker = function(tracker) {

    $scope.final_form_data = angular.copy($scope.form_data);

    $api.update_tracker(tracker.id, $scope.final_form_data).then(function(response) {
      if (response.data.notice) {
        $scope.notice = response.data.notice;
      } else {
        $scope.error = response.data.error;
      }
    });
  };

  $scope.fullSync = function (id) {

    if (confirm("Are you sure?")) {
      $api.full_sync(id).then(function (response) {
        alert('Full sync initiated.  This might take a while... might as well stand up and stretch.');
      });
    } else {
      //do nothing
    }
    
  };

    $scope.convertToTeam = function() {
      if (confirm("Are you sure??")) {
        $api.create_team({ tracker_id:  $routeParams.id }).then(function(team) {
          $location.url("/admin/teams/" + team.slug);
        });
      }
    };

});

