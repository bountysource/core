'use strict';

var ProfileCompleteModalInstanceController = function($scope, $location, $routeParams, $window, $q, $api, $modalInstance) {

  $scope.myLanguagesResolved = false;
  $scope.followedTrackersResolved = false;
  $scope.myTrackersResolved = false;

  $scope.followedTrackers = [];
  $scope.myLanguages = [];

  var currentPersonWatcher = $scope.$watch('current_person', function(person) {
    if (person) {
      // Unregister the listener
      currentPersonWatcher();

      // Load all languages
      $api.languages_get().then(function(languages) {
        // Sort by weight
        $scope.languages = languages.sort(function(a,b) {
          return (a.weight > b.weight ? -1 : (a.weight === b.weight ? 0 : 1));
        });
        return $scope.languages;
      });

      // Get the authenticated person's languages, add them to the languages array once allLanguages loads.
      $api.my_languages_get(person.id).then(function(languages) {
        $scope.myLanguagesResolved = true;
        $scope.myLanguages = angular.copy(languages);
        return $scope.myLanguages;
      });

      // Get trackers that the person already follows
      $api.followed_trackers().then(function(trackers) {
        $scope.followedTrackersResolved = true;
        $scope.followedTrackers = angular.copy(trackers);
        return $scope.followedTrackers;
      });

      // Get projects that the person is associated with, either as owner or org member.
      // Pre-populate followed trackers list with these.
      $api.trackers_get().then(function(trackers) {
        $scope.myTrackersResolved = true;
        for (var i=0; i<trackers.length; i++) {
          $scope.addTracker(trackers[i]);
        }
      });

      // Update languages method
      $scope.updateLanguages = function() {
        var languageIds = [];
        for (var i=0; i<$scope.myLanguages.length; i++) {
          languageIds.push($scope.myLanguages[i].id);
        }
        $api.my_languages_set(languageIds);
      };

      // Get top ranked trackers to show on tracker follow page
      $api.perPage(15).top_trackers_get().then(function(trackers) {
        $scope.topTrackers = angular.copy(trackers);
        return $scope.topTrackers;
      });
    }
  });

  // Close the modal. Also destroys the $scope, allowing the garbage man to come collect it.
  $scope.closeModal = function() {
    $modalInstance.close();
  };

  $scope.completeLater = function() {
    $scope.closeModal();
  };

  // Remove person from developer alert emails, close modal.
  $scope.notInterested = function() {
    $api.person_update({ receive_developer_alerts: false, profile_completed: true });
    $scope.closeModal();
  };

  // Mark the person's profile as completed. Ensure that they receive developer alert emails.
  // Also marks the user's profile as completed
  $scope.completeProfile = function() {
    $api.person_update({ receive_developer_alerts: true, profile_completed: true });
    $scope.closeModal();
  };

  $scope.$currentPageIndex = 0;
  $scope.$pageDefaults = {
    title: 'Sign up for alerts to get notified of new bounties'
  };
  $scope.$pages = [
    {
      id: 'start',
      nextButtonText: 'Change Profile »'
    },
    {
      id: 'trackers',
      title: 'Step 1 of 2: Follow projects to receive bounty alerts',
      subtitle: 'Follow projects to receive email updates when bounties are posted.'
    },
    {
      id: 'languages',
      title: 'Step 2 of 2: Add languages that you know',
      subtitle: 'Add languages to find bounties catered to your skillset.'
    }
  ];

  $scope.$currentPage = $scope.$pages[0];

  $scope.nextPage = function() {
    $scope.setPage($scope.$currentPageIndex + 1);
  };

  $scope.previousPage = function() {
    $scope.setPage($scope.$currentPageIndex - 1);
  };

  $scope.setPage = function(index) {
    if (index < 0) { index = $scope.$currentPageIndex.length - 1; }
    if (index >= $scope.$pages.length) { index = 0; }
    $scope.$currentPageIndex = index;
    $scope.$currentPage = $scope.$pages[index];
  };

  $scope.newLanguage = undefined;

  $scope.languageSelected = function(language) {
    $scope.addLanguage(language);
    $scope.newLanguage = undefined;
  };

  $scope.addLanguage = function(language) {
    for (var i=0; i<$scope.myLanguages.length; i++) {
      if ($scope.myLanguages[i].id === language.id) {
        return;
      }
    }
    $scope.myLanguages.push(angular.copy(language));
    $scope.updateLanguages();
  };

  $scope.removeLanguage = function(language) {
    for (var i=0; i<$scope.myLanguages.length; i++) {
      if ($scope.myLanguages[i].id === language.id) {
        $scope.myLanguages.splice(i,1);
        break;
      }
    }
    $scope.updateLanguages();
  };

  $scope.removeAllLanguages = function() {
    $scope.myLanguages = [];
    $scope.updateLanguages();
  };

  $scope.newFollowedTracker = undefined;
  $scope.resolvingTrackerSearch = false;

  $scope.trackerSearchTypeahead = function($viewValue) {
    $scope.resolvingTrackerSearch = true;

    return $api.tracker_typeahead($viewValue).then(function(trackers) {
      $scope.resolvingTrackerSearch = false;
      return trackers;
    });
  };

  $scope.addTracker = function(tracker) {
    for (var i=0; i<$scope.followedTrackers.length; i++) {
      if ($scope.followedTrackers[i].id === tracker.id) {
        return;
      }
    }
    $api.tracker_follow(tracker.id);
    $scope.followedTrackers.push(tracker);
  };

  // Add tracker to followed list, unless already present.
  $scope.addFollowedTracker = function() {
    if ($scope.newFollowedTracker) {
      $scope.addTracker($scope.newFollowedTracker);
    }
  };

  $scope.removeFollowedTracker = function(tracker) {
    for (var i=0; i<$scope.followedTrackers.length; i++) {
      if ($scope.followedTrackers[i].id === tracker.id) {
        $scope.followedTrackers.splice(i,1);
        break;
      }
    }
    $api.tracker_unfollow(tracker.id);
  };

  $scope.removeAllFollowedTrackers = function() {
    for (var i=0; i<$scope.followedTrackers.length; i++) {
      $api.tracker_unfollow($scope.followedTrackers[i].id);
    }
    $scope.followedTrackers = [];
  };

  $scope.$watch('newFollowedTracker', function(tracker) {
    if (tracker) {
      $scope.addFollowedTracker(tracker);
      $scope.newFollowedTracker = undefined;
    }
  });

};

angular.module('app').run(function($rootScope, $routeParams, $window, $location, $api, $modal) {

  var paramKeyName = 'show_profile_modal';
  var blacklistedRoutes = [
    /^\/signin/
  ];

  // Test current route to see if it is blacklisted.
  // @return true if good, false if bad
  var testRoute = function() {
    for (var i=0; i<blacklistedRoutes.length; i++) {
      if (blacklistedRoutes[i].test($location.path())) {
        return false;
      }
    }
    return true;
  };

  // Test route params for the triggering param.
  // @return true if param present and == 1, false if not
  var testRouteParam = function() {
    return $window.parseInt($routeParams[paramKeyName], 10) === 1;
  };

  var routeChangeListener = $rootScope.$on('$routeChangeSuccess', function() {
    if (testRoute() && testRouteParam()) {
      // Strip param from query string
      $location.search(paramKeyName, null);

      var currentPersonListener = $rootScope.$watch('current_person', function(person) {
        if (person && !person.profile_completed) {
          $modal.open({
            templateUrl: 'common/templates/profileCompleteModal/profileCompleteModal.html',
            controller: ProfileCompleteModalInstanceController,
            backdrop: true
          });

          // Unregister the route change and person listeners.
          currentPersonListener();
          routeChangeListener();
        }
      });
    }
  });
});


