'use strict';

angular.module('directives').directive('teamView', function($rootScope, $location, $routeParams, $api, $analytics) {
  return {
    restrict: 'EAC',
    replace: true,
    transclude: true,
    templateUrl: 'common/directives/teamView/templates/teamView.html',
    link: function(scope) {

      // TODO bring back options hash
      scope.defaultOptions = {
        showTitle: true,
        showNavTabs: true
      };

      scope._options = angular.extend(scope.defaultOptions, scope.options||{});

      /*****************************
      * Navigation Tabs
      * */

      scope.activeNavTab = function(tab) {
        if (tab === 'home' && (/^\/teams\/[^\/]+$/).test($location.path())) { return true; }
        else if (tab === 'fundraiser' && (/^\/teams\/[^\/]+\/fundraisers?$/).test($location.path())) { return true; }
        else if (tab === 'fundraiser' && (/^\/teams\/[^\/]+$/).test($location.path())) { return true; }

        else if (tab === 'members' && (/^\/teams\/[^\/]+\/members$/).test($location.path())) { return true; }
        else if (tab === 'activity' && (/^\/teams\/[^\/]+\/activity$/).test($location.path())) { return true; }
        else if (tab === 'projects' && (/^\/teams\/[^\/]+\/projects+$/).test($location.path())) { return true; }
        else if (tab === 'bounties' && (/^\/teams\/[^\/]+\/bounties$/).test($location.path())) { return true; }
        else if (tab === 'issues' && (/^\/teams\/[^\/]+\/issues$/).test($location.path())) { return true; }
        else if (tab === 'backers' && (/^\/teams\/[^\/]+\/backers$/).test($location.path())) { return true; }

        else if (tab === 'manage' && (/^\/teams\/[^\/]+\/members\/manage$/).test($location.path())) { return true; }
        else if (tab === 'manage' && (/^\/teams\/[^\/]+\/settings$/).test($location.path())) { return true; }
        else if (tab === 'manage' && (/^\/teams\/[^\/]+\/account$/).test($location.path())) { return true; }

        else if (tab === 'issues' && (/^\/teams\/[^\/]+\/issues$/).test($location.path())) { return true; }
        else if (tab === 'suggested_issues' && (/^\/teams\/[^\/]+\/suggested_issues$/).test($location.path())) { return true; }
      };

      /*****************************
       * Top Backers
       * */

      // Load backers after Team is ready
      scope.$watch('team', function(team) {
        if (team) {
          $api.v2.backers({
            team_id: team.id,
            per_page: 10,
            order: '+amount'
          }).then(function(response) {
            scope.topBackers = angular.copy(response.data);
          });
        }
      });

      /*****************************
       * Team Fundraisers
       * */

        // Load backers after Team is ready
      scope.$watch('team', function(team) {
        if (team) {
          $api.v2.fundraisers({
            team_id: team.id,
            include_description_html: true,
            in_progress: true,
            include_rewards: true
          }).then(function(response) {
            scope.fundraisers = angular.copy(response.data);

            // Explicitly set activeFundraiser to false to let the rest of the app know that
            // it was checked for, but not present. A value of undefined means that is still resolving fundraisers.
            scope.activeFundraiser = scope.fundraisers[0] || false;

            if (scope.activeFundraiser) {
              // Calculate percentage of goal met
              scope.activeFundraiser.percentageOfGoalMet = 100 * scope.activeFundraiser.total_pledged / scope.activeFundraiser.funding_goal;

              // Fetch fundraiser rewards
              $api.v2.fundraiserRewards(scope.activeFundraiser.id, {
                order: '-amount'
              }).then(function(response) {
                scope.rewards = angular.copy(response.data);
              });
            }
          });
        }
      });

      /*****************************
       * Pledge Buttons
       * */

      scope.pledgeRedirect = function(amount) {
        amount = amount || 15;
        $location.url('/teams/' + scope.team.slug + '/fundraiser/').search({ page: 'pledge', amount: amount });
      };

      scope.bigPledgeButtonClicked = function() {
        $analytics.pledgeStart({ type: 'bigbutton' });
        scope.pledgeRedirect();
      };

      /*****************************
       * Team Backers (All of em)
       * */

      scope.$watch('team', function(team) {
        if (team) {
          $api.v2.backers({
            team_id: team.id,
            order: '+amount'
          }).then(function(response) {
            scope.backers = angular.copy(response.data);
          });
        }
      });

    }
  };
});
