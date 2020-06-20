angular.module('directives').directive('teamView', function($rootScope, $location, $route, $routeParams, $api, $analytics, $modal, $window, Tag) {
  return {
    restrict: 'EAC',
    replace: true,
    transclude: true,
    templateUrl: 'common/directives/teamView/teamView.html',
    link: function(scope) {

      // TODO bring back options hash
      scope.defaultOptions = {
        showTitle: true,
        showNavTabs: true
      };

      scope._options = angular.extend(scope.defaultOptions, scope.options||{});

      // helpers for salt banner
      scope.$watch('team', function(team) {
        if (team && team.support_level_next_goal) {
          scope.team_support_level_progress_bar_text = Math.round(100 * team.monthly_contributions_sum / team.support_level_next_goal);
          scope.team_support_level_progress_bar_amount = scope.team_support_level_progress_bar_text;
          if (scope.team_support_level_progress_bar_amount > 100) {
            scope.team_support_level_progress_bar_amount = 100;
          } else if (scope.team_support_level_progress_bar_amount < 5) {
            scope.team_support_level_progress_bar_amount = 5;
          }
        }
      });


      /*****************************
      * Navigation Tabs
      * */

      scope.active_tab = function(name) {
        if (name === 'overview' && (/^\/issues\/[a-z-_0-9]+$/i).test($location.path())) { return "active"; }
        if (name === 'backers' && (/^\/issues\/[a-z-_0-9]+\/backers/).test($location.path())) { return "active"; }
      };

      scope.activeNavTab = function(tab) {
        if (tab === 'home' && (/^\/teams\/[^\/]+$/).test($location.path())) { return true; }
        else if (tab === 'fundraiser' && (/^\/teams\/[^\/]+\/fundraiser$/).test($location.path())) { return true; }

        else if (tab === 'members' && (/^\/teams\/[^\/]+\/members$/).test($location.path())) { return true; }
        else if (tab === 'activity' && (/^\/teams\/[^\/]+\/activity$/).test($location.path())) { return true; }
        else if (tab === 'projects' && (/^\/teams\/[^\/]+\/projects+$/).test($location.path())) { return true; }
        else if (tab === 'bounties' && (/^\/teams\/[^\/]+\/bounties$/).test($location.path())) { return true; }
        else if (tab === 'issues' && (/^\/teams\/[^\/]+\/issues$/).test($location.path())) { return true; }
        else if (tab === 'backers' && (/^\/teams\/[^\/]+\/backers$/).test($location.path())) { return true; }
        else if (tab === 'tagged' && (/^\/teams\/[^\/]+\/tagged$/).test($location.path())) { return true; }
        else if (tab === 'updates' && (/^\/teams\/[^\/]+\/updates/).test($location.path())) { return true; }
        else if (tab === 'settings' && (/^\/teams\/[^\/]+\/settings$/).test($location.path())) { return true; }


        else if (tab === 'manage' && (/^\/teams\/[^\/]+\/members\/manage$/).test($location.path())) { return true; }
        else if (tab === 'manage' && (/^\/teams\/[^\/]+\/settings$/).test($location.path())) { return true; }
        else if (tab === 'manage' && (/^\/teams\/[^\/]+\/projects\/manage$/).test($location.path())) { return true; }

        else if (tab === 'issues' && (/^\/teams\/[^\/]+\/issues$/).test($location.path())) { return true; }
        else if (tab === 'suggested_issues' && (/^\/teams\/[^\/]+\/suggested_issues$/).test($location.path())) { return true; }
      };

      /*****************************
       * Top Backers
       * */

      // Load backers after Team is ready
      scope.$watch('team', function(team) {
        if (team) {

          scope.team_tags = {
            current: Tag.query({ parent_id: team.id, parent_type: 'Team' }),

            toggle_edit: function() {
              if ($rootScope.current_person) {
                scope.team_tags.editing = !scope.team_tags.editing;
              } else {
                $api.require_signin();
              }
            },

            submit_form: function(options) {
              options.parent_type = 'Team';
              options.parent_id = team.id;
              options.team_add_child = team;

              Tag.create(options, function(current_tags) {
                scope.team_tags.current = current_tags;
                scope.team_tags.new_tag_name = null;
              });
            },

            has_enough_votes: function(tag) {
              return tag.votes > 0;
            },

            typeahead_tags: function(search_text) {
              return Tag.query({ search: search_text }).$promise;
            }

          };

          if (team.id) {
            $api.v2.backers({
              team_id: team.id,
              per_page: 10,
              order: '+amount'
            }).then(function(response) {
              scope.topBackers = angular.copy(response.data);
            });
          }
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
            include_owner: true,
            include_rewards: true
          }).then(function(response) {
            scope.fundraisers = angular.copy(response.data);
            // Explicitly set activeFundraiser to false to let the rest of the app know that
            // it was checked for, but not present. A value of undefined means that is still resolving fundraisers.
            scope.activeFundraiser = findActiveFundraiser(scope.fundraisers);
            if (scope.activeFundraiser) {
              // Is the authenticated user the owner of the Fundraiser?
              scope.canManageActiveFundraiser = false;
              $rootScope.$watch('current_person', function(person) {
                if (person) {
                  scope.canManageActiveFundraiser = (scope.activeFundraiser.owner.id === person.id);
                }
              });

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

      // return either an active & published fundraiser or return the most recent completed fundraiser
      function findActiveFundraiser (fundraisers) {
        var completed_fundraisers = [];
        var active_fundraisers = [];
        var draft_fundraisers = [];

        // split fundraisers up into groups
        for (var i = 0; i < fundraisers.length; i++) {
          if(fundraisers[i].published && fundraisers[i].in_progress) {
            active_fundraisers.push(fundraisers[i]);
          } else if (fundraisers[i].published && !fundraisers[i].in_progress) {
            completed_fundraisers.push(fundraisers[i]);
          } else {
            draft_fundraisers.push(fundraisers[i]);
          }
        }

        // return active fundraiser if one exists. There should only ever be one active fundraiser
        if (active_fundraisers.length > 0) {
          return active_fundraisers[0];
        } else if (completed_fundraisers.length > 0) {
          // get most recent completed fundraiser
          return completed_fundraisers[completed_fundraisers.length - 1];
        } else {
          return false;
        }
      }

      // **************************
      // Pledge Buttons
      // **************************

      function addPledge (amount, reward_id) {
        
      }

      scope.pledgeRedirect = function(amount, reward_id) {
        // Add pledge and redirect to cart
        addPledge($window.parseFloat(amount), reward_id);
      };

      scope.pledgeWithRewardRedirect = function(reward) {
        $analytics.pledgeStart({ amount: reward.amount, type: 'reward' });
        scope.pledgeRedirect(reward.amount, reward.id);
      };

      scope.bigPledgeButtonClicked = function() {
        $analytics.pledgeStart({ type: 'bigbutton' });

        // Amount required, send with the default amount
        // for the current currency value.
        scope.pledgeRedirect(null);
      };


      scope.customPledgeRedirect = function(amount) {
        $analytics.pledgeStart({ amount: amount, type: 'custom' });
        addPledge(amount);
      };

      /*****************************
       * All Team Backers
       **/

      scope.$watch('team', function(team) {
        if (team) {
          $api.v2.backers({
            team_id: team.id,
            order: '+amount',
            per_page: 10
          }).then(function(response) {
            scope.backers = angular.copy(response.data);
          });
        }
      });

      scope.bountyHunterOptIn = function() {
        if ($rootScope.current_person) {
          $api.people.update({ id: $rootScope.current_person.id, bounty_hunter_opt_in_team: scope.team.slug }, $route.reload);
        } else {
          $api.require_signin();
        }
      };

      scope.bountyHunterOptOut = function() {
        if ($rootScope.current_person) {
          $api.people.update({ id: $rootScope.current_person.id, bounty_hunter_opt_out_team: scope.team.slug }, $route.reload);
        } else {
          $api.require_signin();
        }
      };

    }
  };
});
