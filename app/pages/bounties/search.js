'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/bounties/search', {
        templateUrl: 'pages/bounties/search.html',
        controller: 'BountiesSearchController',
      });
  })

  .controller('BountiesSearchController', function($scope, $routeParams, $location, $api) {

    $scope.form_data = {
      direction: "desc"
    }

    $scope.sort_options = [
      {},
      { label: "Bounty Total", value: "bounty_total" },
      { label: "Age of Issue", value: "remote_created_at"}
    ];

    $scope.languages_selected = [];

    $scope.trackers_selected = [];

    $scope.top_trackers = $api.project_cards().then(function(trackers) {
      for (var i=0; i<trackers.length; i++) {
        trackers[i].bounty_total = parseFloat(trackers[i].bounty_total);
      }
      return trackers;
    });

    $scope.languages = $api.languages_get().then(function(languages) {

      $scope.$watch('selected_language', function(newValue, oldValue, scope) {

        for (var i = 0; i < languages.length; i++) {
          if (newValue.id === languages[i].id) {
            scope.languages_selected.push(newValue);
            scope.selected_language = "";
            break;
          }
        };
      });
      return languages;
    });


    $scope.remove_language = function(language) {
      for (var i = 0; i < $scope.languages_selected.length; i++) {
        if (language.id === $scope.languages_selected[i].id) {
          $scope.languages_selected.splice(i, 1);
          break;
        }
      }
    };


    $scope.remove_tracker = function(tracker) {
      for (var i = 0; i < $scope.trackers_selected.length; i++) {
        if (tracker.id === $scope.trackers_selected[i].id) {
          $scope.trackers_selected.splice(i, 1);
          break;
        }
      }
    };

    $scope.doTypeahead = function ($viewValue) {
      return $api.tracker_typeahead($viewValue).then(function (trackers) {
        $scope.$watch('selected_tracker', function(newValue, oldValue, scope) {

          for (var i = 0; i < trackers.length; i++) {
            if (newValue.id === trackers[i].id) {
              scope.trackers_selected.push(newValue);
              scope.selected_tracker = "";
              console.log(scope.trackers_selected);
              break;
            }
          };
        });
        return trackers;
      });
    };
    
    $scope.submit_query = function() {
      $scope.form_data.languages = $scope.languages_selected.map(function(language) {
        return language.id;
      });

      $scope.form_data.trackers = $scope.trackers_selected.map(function(tracker) {
        return tracker.id;
      });

      $scope.form_data.per_page = 50;

      $api.bounty_search($scope.form_data).then(function(response) {
        console.log(response);  
        return response;
      });
    };
  });
