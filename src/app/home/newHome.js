'use strict';

angular.module('app').controller('newHomeCtrl', function ($scope, $window, $api) {
  $scope.tabs_resolved = false;

  $scope.set_current_saved_search_tab = function(selected_tab) {
    for (var i=0;i<$scope.tabs_collection.length;i++) {
      var tab = $scope.tabs_collection[i];
      if (selected_tab === tab) {
        $scope.current_saved_search_tab = selected_tab;
        if (!selected_tab.issues) {
          $scope.construct_tab_results(selected_tab);
        } else {
          $scope.tab_results_resolved = true; //set to true in case tab results are cached and user has clicked over from a tab with results still in loading process
        }
        break;
      }
    }
  };

  $scope.construct_tab_results = function(tab) {
    $scope.tab_results_resolved = false;
    $api.call(tab.query).then(function(issues) {
      if (!issues.error) {
        for (var i=0;i<issues.length;i++) {
          var issue = issues[i];
          // sorting doesn't like nulls.. this is a quick hack
          issue.participants_count = issue.participants_count || 0;
          issue.thumbs_up_count = issue.thumbs_up_count || 0;
          issue.comment_count = issue.comment_count || 0;
        }
      } else {
        issues = [];
      }

      tab.issues = issues;
      $scope.tab_results_resolved = true;
    });
  };

  $api.saved_search_tabs().then(function(tabs_collection) {
    $scope.tabs_collection = tabs_collection; //TODO sort by created_at
    if (tabs_collection[0]) {
      $scope.set_current_saved_search_tab(tabs_collection[0]); //then grab earliest item, set to current_saved_search_tab
    }
    $scope.tabs_resolved = true;
  });

  $scope.active_tab = function(tab) {
    if (tab === 'search' && !$scope.current_saved_search_tab) {
      return true;
    } else {
      return tab === $scope.current_saved_search_tab;
    }
  };

  $scope.remove_saved_search = function() {};

  $scope.set_search_tab = function() {
    $scope.current_saved_search_tab = null;
  };

  $scope.submit_saved_search = function(form_data) {
    var query = "/search/bounty_search?search="+form_data.search;
    var new_tab = { name: form_data.name, query: query };
    $scope.tabs_collection.push(new_tab);
    $scope.set_current_saved_search_tab(new_tab);
  };

});
