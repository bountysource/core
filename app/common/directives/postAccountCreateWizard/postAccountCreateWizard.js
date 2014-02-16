'use strict';

angular.module('bountysource.directives').directive('postAccountCreateWizard', function($location, $routeParams, $window, $q, $api) {
  return {
    scope: true,
    templateUrl: 'common/directives/postAccountCreateWizard/templates/postAccountCreateWizard.html',
    link: function(scope) {
      scope.paramName = 'show_profile_modal';

      scope.blacklistedRoutes = [
        /^\/signin/
      ];

      scope.$$showModal = false;

      scope.myLanguagesResolved = false;
      scope.followedTrackersResolved = false;
      scope.myTrackersResolved = false;

      scope.followedTrackers = [];
      scope.myLanguages = [];

      var routeChangeListener = scope.$on('$routeChangeSuccess', function() {
        // Don't include this directive in the test environment, it breaks everything.
        // Unregister the route change listener.
        if ($api.environment.test()) {
          return routeChangeListener();
        }

        // Parse route param (it should be set to 1) to show/hide modal.
        var routeParamValue = $window.parseInt($routeParams[scope.paramName], 10) === 1;

        // Listen for person if the routeParam is present, and this is not a blacklisted route for
        // displaying the modal.
        if (routeParamValue && scope.testRoute()) {
          // Strip the param off now
          $location.search(scope.paramName, null);

          var currentPersonListener = scope.$watch('current_person', function(person) {
            if (person && !person.profile_completed) {
              scope.$$showModal = true;

              // Unregister listeners
              currentPersonListener();
              routeChangeListener();

              // Load all languages
              $api.languages_get().then(function(languages) {
                // Sort by weight
                scope.languages = languages.sort(function(a,b) {
                  return (a.weight > b.weight ? -1 : (a.weight === b.weight ? 0 : 1));
                });
                return scope.languages;
              });

              // Get the authenticated person's languages, add them to the languages array once allLanguages loads.
              $api.my_languages_get(person.id).then(function(languages) {
                scope.myLanguagesResolved = true;
                scope.myLanguages = angular.copy(languages);
                return scope.myLanguages;
              });

              // Get trackers that the person already follows
              $api.followed_trackers().then(function(trackers) {
                scope.followedTrackersResolved = true;
                scope.followedTrackers = angular.copy(trackers);
                return scope.followedTrackers;
              });

              // Get projects that the person is associated with, either as owner or org member.
              // Pre-populate followed trackers list with these.
              $api.trackers_get().then(function(trackers) {
                scope.myTrackersResolved = true;
                for (var i=0; i<trackers.length; i++) {
                  scope.addTracker(trackers[i]);
                }
              });

              // Update languages method
              scope.updateLanguages = function() {
                var languageIds = [];
                for (var i=0; i<scope.myLanguages.length; i++) {
                  languageIds.push(scope.myLanguages[i].id);
                }
                $api.my_languages_set(languageIds);
              };

              // Get top ranked trackers to show on tracker follow page
              $api.perPage(15).top_trackers_get().then(function(trackers) {
                scope.topTrackers = angular.copy(trackers);
                return scope.topTrackers;
              });
            }
          });
        }
      });

      // Test current route to see if it is blacklisted.
      // @return true if good, false if bad
      scope.testRoute = function() {
        for (var i=0; i<scope.blacklistedRoutes.length; i++) {
          if (scope.blacklistedRoutes[i].test($location.path())) {
            return false;
          }
        }
        return true;
      };

      // Show the modal!
      scope.showModal = function() {
        scope.$$showModal = true;
        $window._gaq.push(['_trackEvent', 'ProfileCompleteModal' , 'show']);
      };

      // Close the modal. Also destroys the scope, allowing the garbage man to come collect it.
      scope.closeModal = function() {
        scope.$$showModal = false;
      };

      scope.completeLater = function() {
        scope.closeModal();

        $window._gaq.push(['_trackEvent', 'ProfileCompleteModal' , 'complete_later']);
      };

      // Remove person from developer alert emails, close modal.
      scope.notInterested = function() {
        $api.person_update({ receive_developer_alerts: false, profile_completed: true });
        scope.closeModal();

        $window._gaq.push(['_trackEvent', 'ProfileCompleteModal' , 'not_interested']);
      };

      // Mark the person's profile as completed. Ensure that they receive developer alert emails.
      // Also marks the user's profile as completed
      scope.completeProfile = function() {
        $api.person_update({ receive_developer_alerts: true, profile_completed: true });
        scope.closeModal();

        $window._gaq.push(['_trackEvent', 'ProfileCompleteModal' , 'accept']);
      };

      scope.$$currentPageIndex = 0;
      scope.$$pageDefaults = {
        title: 'Sign up for alerts to get notified of new bounties'
      };
      scope.$$pages = [
        {
          nextButtonText: 'Change Profile »',
          templateUrl: 'common/directives/postAccountCreateWizard/templates/start.html'
        },
        {
          title: 'Step 1 of 2: Follow projects to receive bounty alerts',
          subtitle: 'Follow projects to receive email updates when bounties are posted.',
          templateUrl: 'common/directives/postAccountCreateWizard/templates/trackers.html'
        },
        {
          title: 'Step 2 of 2: Add languages that you know',
          subtitle: 'Add languages to find bounties catered to your skillset.',
          templateUrl: 'common/directives/postAccountCreateWizard/templates/languages.html'
        }
      ];

      scope.$$currentPage = scope.$$pages[0];

      scope.nextPage = function() {
        scope.setPage(scope.$$currentPageIndex + 1);
      };

      scope.previousPage = function() {
        scope.setPage(scope.$$currentPageIndex - 1);
      };

      scope.setPage = function(index) {
        if (index < 0) { index = scope.$$currentPageIndex.length - 1; }
        if (index >= scope.$$pages.length) { index = 0; }
        scope.$$currentPageIndex = index;
        scope.$$currentPage = scope.$$pages[index];
      };

      scope.addLanguage = function(language) {
        for (var i=0; i<scope.myLanguages.length; i++) {
          if (scope.myLanguages[i].id === language.id) {
            return;
          }
        }
        scope.myLanguages.push(angular.copy(language));
        scope.updateLanguages();

        $window._gaq.push(['_trackEvent', 'ProfileCompleteModal' , 'add_language/', language.id]);
      };

      scope.removeLanguage = function(language) {
        for (var i=0; i<scope.myLanguages.length; i++) {
          if (scope.myLanguages[i].id === language.id) {
            scope.myLanguages.splice(i,1);
            break;
          }
        }
        scope.updateLanguages();

        $window._gaq.push(['_trackEvent', 'ProfileCompleteModal' , 'remove_language/', language.id]);
      };

      scope.removeAllLanguages = function() {
        scope.myLanguages = [];
        scope.updateLanguages();

        $window._gaq.push(['_trackEvent', 'ProfileCompleteModal' , 'remove_all_languages']);
      };

      scope.newLanguage = undefined;

      // Watch language typeahead
      scope.$watch('newLanguage', function(language) {
        if (language) {
          scope.addLanguage(language);
          scope.newLanguage = undefined;
        }
      });

      scope.newFollowedTracker = undefined;
      scope.resolvingTrackerSearch = false;

      scope.trackerSearchTypeahead = function($viewValue) {
        scope.resolvingTrackerSearch = true;

        return $api.tracker_typeahead($viewValue).then(function(trackers) {
          scope.resolvingTrackerSearch = false;
          return trackers;
        });
      };

      scope.addTracker = function(tracker) {
        for (var i=0; i<scope.followedTrackers.length; i++) {
          if (scope.followedTrackers[i].id === tracker.id) {
            return;
          }
        }
        $api.tracker_follow(tracker.id);
        scope.followedTrackers.push(tracker);

        $window._gaq.push(['_trackEvent', 'ProfileCompleteModal' , 'follow_tracker', tracker.id]);
      };

      // Add tracker to followed list, unless already present.
      scope.addFollowedTracker = function() {
        if (scope.newFollowedTracker) {
          scope.addTracker(scope.newFollowedTracker);
        }
      };

      scope.removeFollowedTracker = function(tracker) {
        for (var i=0; i<scope.followedTrackers.length; i++) {
          if (scope.followedTrackers[i].id === tracker.id) {
            scope.followedTrackers.splice(i,1);
            break;
          }
        }
        $api.tracker_unfollow(tracker.id);

        $window._gaq.push(['_trackEvent', 'ProfileCompleteModal' , 'unfollow_tracker/' + tracker.id]);
      };

      scope.removeAllFollowedTrackers = function() {
        for (var i=0; i<scope.followedTrackers.length; i++) {
          $api.tracker_unfollow(scope.followedTrackers[i].id);
        }
        scope.followedTrackers = [];

        $window._gaq.push(['_trackEvent', 'ProfileCompleteModal' , 'unfollow_all_trackers']);
      };

      scope.$watch('newFollowedTracker', function(tracker) {
        if (tracker) {
          scope.addFollowedTracker(tracker);
          scope.newFollowedTracker = undefined;
        }
      });
    }
  };
});