'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/trackers/:id/edit', {
        templateUrl: 'pages/trackers/edit.html',
        controller: 'TrackersEditController',
        title: 'Projects'
      });
  })
  .controller('TrackersEditController', function ($scope, $api, $routeParams, $pageTitle) {
    $api.tracker_get($routeParams.id).then(function (tracker) {

      $scope.tracker = tracker;
      $scope.form_data = {
        name: tracker.name,
        description: tracker.description,
        homepage: tracker.homepage,
        image_url: tracker.image_url,
        repo_url: tracker.repo_url,
      };

      $scope.form_data.languages = tracker.languages;

      // tracker pictures
      $scope.tracker_input = {
        radio: $scope.form_data.image_url
      };

      $pageTitle.set(tracker.name, 'Edit Project');

      $scope.save = function (form_data) {
        $scope.error = false;
        $scope.success = false;

        if ($scope.tracker_input.radio === 'custom') {
          $scope.form_data.image_url = $scope.tracker_input.text;
        } else {
          $scope.form_data.image_url = $scope.tracker_input.radio;
        }

        //clean form_data before submission
        $scope.form_data.language_ids = [];
        for (var i = 0; i < $scope.form_data.languages.length; i++) {
          $scope.form_data.language_ids.push($scope.form_data.languages[i].id);
        }

        $scope.final_form_data = angular.copy($scope.form_data)
       ;delete $scope.final_form_data.languages;

        $api.update_tracker(tracker.id, $scope.final_form_data).then(function (response) {
          if (response.error) {
            $scope.error = response.error;
          } else {
            $scope.form_data.languages = response.data.languages;
            $scope.success = true;
          }
        });

      };
    });

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

