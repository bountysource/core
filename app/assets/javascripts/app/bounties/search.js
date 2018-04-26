angular.module('app').controller('BountiesSearchController', function($scope, $routeParams, $location, $api, $filter, $anchorScroll) {
  // sets drop-down bounty types
  $scope.bounty_types = ["Show All Bounties", "Crypto Bounties Only", "Cash Bounties Only"];

  //sets drop-down sorting options
  $scope.sort_options = {
    option1 : { label: "Value (Highest to Lowest)", value: "bounty_total", direction: "desc"},
    option2 : { label: "Value (Lowest to Highest)", value: "bounty_total", direction: "asc"},
    option3 : { label: "Date (Newest to Oldest", value: "earliest_bounty", direction: "desc"},
    option4 : { label: "Date (Oldest to Newest", value: "earliest_bounty", direction: "asc"},
    option5 : { label: "Backers (Most to Least)", value: "backers_count", direction: "desc"},
    option6 : { label: "Backers (Least to Most)", value: "backers_count", direction: "asc"}
  };

  $scope.selectSort = function() {
    if ($scope.form_data.order) {
      for (var i=1;i<=Object.keys($scope.sort_options).length;i++) {
        if ($scope.sort_options['option' + i].value === $scope.form_data.order) {
          if ($scope.sort_options['option' + i].direction === $scope.form_data.direction) {
            $scope.selectedSort = $scope.sort_options['option' + i];
            break;
          }
        }
      }
    } else {
      $scope.selectedSort = $scope.sort_options['option1'];
    }
  }

  // update order and direction when options change
  $scope.updateSort = function(selectedSort) {
    $scope.form_data.order = selectedSort.value;
    $scope.form_data.direction = selectedSort.direction;
  }

  // toggle advanced search collapse
  $scope.toggle_advanced_search = function () {
    $scope.show_advanced_search = !$scope.show_advanced_search;
  };

  // trackers search
  $scope.select_form = {};

  $scope.do_tracker_typeahead = function($viewValue) {
    return $api.tracker_typeahead($viewValue)
  };

  $scope.selectTracker = function($item, $model, $label){
    $scope.form_data.trackers = $scope.form_data.trackers || [];
    if($scope.form_data.trackers.indexOf($item.name) === -1) {
      $scope.form_data.trackers.push($item.name);
    }
    $scope.select_form.trackers_input = "";
  }
  
  //removes trackers from trackers_loaded array
  $scope.remove_tracker = function(tracker) {
    var index = $scope.form_data.trackers.indexOf(tracker)
    if (index !== -1) $scope.form_data.trackers.splice(index, 1);
  };

  // language search
  $scope.getLanguage = function() {
    $api.languages_get().then(function(languages) {
      $scope.select_form.all_languages = languages;
    });
  }

  $scope.selectLanguage = function($item, $model, $label){
    $scope.form_data.languages = $scope.form_data.languages || [];
    if($scope.form_data.languages.indexOf($item.name) === -1) {
      $scope.form_data.languages.push($item.name);
    }
    $scope.select_form.languages_input = "";
  }

  //removes languages from selected_languages array
  $scope.remove_language = function(language) {
    var index = $scope.form_data.languages.indexOf(language)
    if (index !== -1) $scope.form_data.languages.splice(index, 1);
  };

  $scope.submit_query = function(page) {
    if (page) {
      $scope.form_data.page = page;
    } else {
      $scope.loading_search_results = true;
    }

    var cleaned_form_data = clean_object($scope.form_data);
    $location.search(cleaned_form_data);
    $api.bounty_search(cleaned_form_data).then(function(response) {
      $scope.search_results = response.issues;
      $scope.issues_count = response.issues_total;
      $scope.perPage = 50;
      $scope.maxSize = 10;
      $scope.pageCount = Math.ceil($scope.issues_count / $scope.perPage);
      $scope.loading_search_results = false;
      $anchorScroll();
    });
  };

  var clean_object = function(data) {
    if (!data) {
      return false;
    }
    var result = {};
    for (var key in data) {
      var value = data[key];
      if (!value) { // null or undefined ng-model values
        continue;
      }

      var value_typeof = typeof value;
      switch(value_typeof) {
      case 'string':
        if (value !== "") {
          result[key] = value;
        }
        break;
      case 'object':
        // case to handle arrays
        if (angular.isArray(value)) {
          result[key] = value.toString();
          break;
        }

        if (typeof value.length !== 'undefined') { // needed to prevent a value.length of zero from evaluating to false
          if (value.length > 0) {
            result[key] = value;
          }
        } else { // not a hash, keep object
          result[key] = value;
        }
        break;
      case 'number':
        if (value !== 0) {
          result[key] = value;
        }
        break;
      }
    }
    return result;
  };

  //updates pagination. resubmits query with new page number.
  $scope.updatePage = function(page) {
    $scope.submit_query(page);
  };

  //update scope from route params
  $scope.populate_form_data_with_route_params = function() {
    if (Object.keys($routeParams).length > 0) {
      for (var key in $routeParams) {
        if (!$routeParams[key] || $routeParams[key] === "" || $routeParams[key].length < 1) { // if $routeParams value is undefined, blank, or length is less than 1
          continue;
        }
        else if ((key === "languages" || key === "trackers") && $routeParams[key]) {
          var string_arr = $routeParams[key].split(",");
          $scope.form_data[key] = [];
          for (var i=0;i<string_arr.length;i++) {
            $scope.form_data[key].push(string_arr[i]);
          }
          $scope.show_advanced_search = true;
        }
        else if((key === "min" || key === "max") && $routeParams[key]) {
          $scope.form_data[key] = parseInt($routeParams[key], 10);
          $scope.show_advanced_search = true;
        }
        else {
          $scope.form_data[key] = $routeParams[key];
        }
      }
    }
  };

  $scope.initiate = function() {
    $scope.form_data = {};
    $scope.populate_form_data_with_route_params();
    $scope.bountyType = $scope.bounty_types[0];
    $scope.getLanguage();
    $scope.selectSort();
    $scope.submit_query();
  }

  $scope.initiate();
});