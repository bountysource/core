'use strict';

angular.module('app').controller('TrackersEditController', function ($scope, $api, $routeParams, $pageTitle, $location, $window) {
  $api.tracker_get($routeParams.id).then(function (tracker) {
    $scope.form_data = {
      name: tracker.name,
      description: tracker.description,
      image_url: undefined,
      homepage: tracker.homepage,
      repo_url: tracker.repo_url
    };

    $scope.form_data.languages = tracker.languages;

    // Save master copy of form data to detect changes
    $scope.form_data_master = angular.copy($scope.form_data);

    // tracker pictures
    $scope.tracker_input = {
      radio: $scope.form_data.image_url
    };

    $pageTitle.set(tracker.name, 'Edit Project');

    $scope.tracker = tracker;
    return tracker;
  });

  // Save form data changes, applying changes to the Tracker
  $scope.save = function() {
    if ($scope.form.$invalid || !$scope.unsaved_changes()) { return; }

    $scope.saving = true;

    var payload = angular.copy($scope.form_data);
    payload.image_url = $scope.form_data.image_url || $scope.tracker.large_image_url;

//      // Add language IDs from selected languages
//      payload.language_ids = [];
//      for (var i=0; i<$scope.form_data.languages.length; i++) {
//        payload.language_ids.push($scope.form_data.languages[i].id);
//      }
//      delete payload.languages;

    $api.update_tracker($routeParams.id, payload).then(function(response) {
      if (!response.meta.success) {
        $scope.alert = { message: response.data.error, type: 'danger' };
      } else {
        $scope.saving = false;

        // $scope.alert = { message: "Tracker updated!", type: 'success' };

        // Rebuild form data and master copy of data
        $scope.form_data = {
          name: response.data.name,
          description: response.data.description,
          image_url: undefined,
          homepage: response.data.homepage,
          repo_url: response.data.repo_url
        };
        $scope.form_data.languages = response.data.languages;
        $scope.form_data_master = angular.copy($scope.form_data);

        // Update the underlying Tracker model
        for (var k in response.data) {
          $scope.tracker[k] = response.data[k];
        }

        // Reload page title with new tracker, to handle the name being changed
        $pageTitle.set($scope.tracker.name, "Edit");
      }
    });

  };

  // Cancel changes and go back to Tracker overview page
  $scope.cancel = function() {
    if ($scope.unsaved_changes()) {
      if ($window.confirm("You have unsaved changes. Cancel anyway?")) {
        $location.url("/trackers/"+$routeParams.id);
      }
    } else {
      $location.url("/trackers/"+$routeParams.id);
    }
  };

  // Are there unsaved changes pending?
  $scope.unsaved_changes = function() {
    return !angular.equals($scope.form_data_master, $scope.form_data);
  };

  // Check to see if a single value has been changed from the current value
  $scope.value_changed = function(name) {
    return !angular.equals($scope.form_data[name], $scope.form_data_master[name]);
  };

  //grabs all languages. Pushes all languages into languages_selected array
  $scope.languages_selected = [];

  $scope.languages = [];
  $api.languages_get().then(function(languages) {
    languages.sort(function(a,b) {
      return (a.weight > b.weight ? -1 : (a.weight === b.weight ? 0 : 1));
    });

    $scope.$watch('selected_language', function(newValue, oldValue, scope) {
      for (var i = 0; i < languages.length; i++) {
        if (!newValue) {
          break;
        }
        if (newValue.id === languages[i].id) {
          scope.form_data.languages.push(newValue);
          scope.selected_language = "";
          break;
        }
      }
    });

    $scope.languages = angular.copy(languages);
    return $scope.languages;
  });

  $scope.remove_language = function (language) {
    for (var i = 0; i < $scope.form_data.languages.length; i++) {
      if ($scope.form_data.languages[i].id === language.id) {
        $scope.form_data.languages.splice(i, 1);
        break;
      }
    }
  };
});
