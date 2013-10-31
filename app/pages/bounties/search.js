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

    //sets defaults search options
    $scope.form_data = {
      direction: "desc",
      order: "bounty_total"
    };

    //sets drop-down sorting options
    $scope.sort_options = [
      { label: "Bounty Total", value: "bounty_total", asc: "High to Low", desc: "Low to High"},
      { label: "Age of Issue", value: "remote_created_at"},
      { label: "Number of Backers", value: "backer_count"},
      { label: "Date Bounty Posted", value: "earliest_bounty"}
    ];

    //renders direction toggle button
    $scope.update_direction = function(order) {
      var asc_string, desc_string;
      switch(order) {
      case "bounty_total":
        asc_string = "Lowest";
        desc_string = "Highest";
        break;
      case "remote_created_at":
        asc_string = "Oldest";
        desc_string = "Newest";
        break;
      case "backer_count":
        asc_string = "Least";
        desc_string= "Most";
        break;
      case "earliest_bounty":
        asc_string = "Oldest";
        desc_string = "Newest";
        break;
      default:
        asc_string = "Asc";
        desc_string = "Desc";
        break;
      }
      return { asc: asc_string, desc: desc_string };
    };

    $scope.featured_issues = $api.issues_featured({ limit: 5 }).then(function(response) {
      return response;
    });

    //grabs all languages. Pushes all languages into languages_selected array
    $scope.languages_selected = [];

    $scope.languages = [];
    $api.languages_get().then(function(languages) {
      $scope.languages = languages;

      $scope.$watch('selected_language', function(newValue, oldValue, scope) {
        for (var i = 0; i < languages.length; i++) {
          if (!newValue) {
            break;
          }
          if (newValue.id === languages[i].id) {
            scope.languages_selected.push(newValue);
            scope.selected_language = "";
            break;
          }
        }
      });
    });

    //removes languages from selected_languages array
    $scope.remove_language = function(language) {
      for (var i = 0; i < $scope.languages_selected.length; i++) {
        if (language.id === $scope.languages_selected[i].id) {
          $scope.languages_selected.splice(i, 1);
          break;
        }
      }
    };

    //adds trackers to trackers_selected array
    $scope.trackers_selected = [];

    $scope.doTypeahead = function ($viewValue) {
      return $api.tracker_typeahead($viewValue).then(function (trackers) {
        $scope.$watch('selected_tracker', function(newValue, oldValue, scope) {
          for (var i = 0; i < trackers.length; i++) {
            if (!newValue) {
              break;
            }
            if (newValue.id === trackers[i].id) {
              scope.trackers_selected.push(newValue);
              scope.selected_tracker = "";
              break;
            }
          }
        });
        return trackers;
      });
    };

    //removes trackers from trackers_selected array
    $scope.remove_tracker = function(tracker) {
      for (var i = 0; i < $scope.trackers_selected.length; i++) {
        if (tracker.id === $scope.trackers_selected[i].id) {
          $scope.trackers_selected.splice(i, 1);
          break;
        }
      }
    };

    //parses query parameters and submits form with pagination
    $scope.submit_query = function(page) {
      $scope.search_submitted = true;

      if (!page) {
        $scope.working = true;
      }

      $scope.form_data.languages = $scope.languages_selected.map(function(language) {
        return language.id;
      });

      $scope.form_data.trackers = $scope.trackers_selected.map(function(tracker) {
        return tracker.id;
      });

      $scope.form_data.per_page = 50;
      $scope.form_data.page = page || 1;

      $api.bounty_search($scope.form_data).then(function(response) {
        $scope.search_results = response.issues;
        $scope.issues_count = response.issues_total;
        $scope.perPage = 50;
        $scope.maxSize = 10;
        $scope.pageCount = Math.ceil($scope.issues_count / $scope.perPage);
        $scope.working = false;
      });
    };

    //updates pagination. resubmits query with new page number.
    $scope.updatePage = function(page) {
      $scope.submit_query(page);
    };

    //toggles column order and submits query
    $scope.change_order_col = function(col, page) {

      if ($scope.form_data.order === col) {
        if ($scope.form_data.direction === 'asc') {
          $scope.form_data.direction = 'desc';
        } else {
          $scope.form_data.direction = 'asc';
        }
      }
      $scope.form_data.order = col;

      $scope.submit_query(page);
    };
  });
