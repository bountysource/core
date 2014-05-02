'use strict';

angular.module('directives').directive('teamView', function($rootScope, $location, $routeParams, $api, $analytics, $modal, $currency, $cart) {
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
        else if (tab === 'fundraiser' && (/^\/teams\/[^\/]+\/fundraiser$/).test($location.path())) { return true; }

        else if (tab === 'members' && (/^\/teams\/[^\/]+\/members$/).test($location.path())) { return true; }
        else if (tab === 'activity' && (/^\/teams\/[^\/]+\/activity$/).test($location.path())) { return true; }
        else if (tab === 'projects' && (/^\/teams\/[^\/]+\/projects+$/).test($location.path())) { return true; }
        else if (tab === 'bounties' && (/^\/teams\/[^\/]+\/bounties$/).test($location.path())) { return true; }
        else if (tab === 'issues' && (/^\/teams\/[^\/]+\/issues$/).test($location.path())) { return true; }
        else if (tab === 'backers' && (/^\/teams\/[^\/]+\/backers$/).test($location.path())) { return true; }
        else if (tab === 'updates' && (/^\/teams\/[^\/]+\/updates$/).test($location.path())) { return true; }

        else if (tab === 'manage' && (/^\/teams\/[^\/]+\/members\/manage$/).test($location.path())) { return true; }
        else if (tab === 'manage' && (/^\/teams\/[^\/]+\/settings$/).test($location.path())) { return true; }
        else if (tab === 'manage' && (/^\/teams\/[^\/]+\/account$/).test($location.path())) { return true; }
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

      /*****************************
       * Pledge Buttons
       * */
      scope.pledgeRedirect = function(amount, reward_id) {
        $analytics.pledgeStart({ amount: amount, type: 'buttons' });

        scope.$watch('activeFundraiser', function (fundraiser) {
          if (angular.isObject(fundraiser)) {
            if (fundraiser) {
              return $cart.addPledge({
                amount: amount,
                currency: $currency.value,
                fundraiser_id: fundraiser.id,
                reward_id: reward_id
              }).then(function () {
                $location.url('/cart');
              });
            }
          }
        });
      };

      scope.payinRedirect = function (amount) {
        $analytics.teamPayinStart({ amount: amount, type: 'buttons'});

        scope.$watch('team', function (team) {
          if (angular.isObject(team)) {
            return $cart.addTeamPayin({
              amount: amount,
              currency: $currency.value,
              team_id: team.id
            }).then(function () {
              $location.url('/cart');
            });
          }
        });
      };

      scope.pledgeWithRewardRedirect = function(reward) {
        $analytics.pledgeStart({ amount: reward.amount, type: 'reward' });

        var amount = $currency.convert(reward.amount, 'USD', $currency.value);
        scope.pledgeRedirect(amount, reward.id);
      };

      scope.bigPledgeButtonClicked = function() {
        $analytics.pledgeStart({ type: 'bigbutton' });

        // Amount required, send with the default amount
        // for the current currency value.
        scope.pledgeRedirect(null);
      };

      scope.customPayinRedirect = function (amount) {
        $analytics.teamPayinStart({ amount: amount, type: 'custom'});
        scope.pledgeRedirect(amount);
      };

      scope.customPledgeRedirect = function(amount) {
        $analytics.pledgeStart({ amount: amount, type: 'custom' });
        scope.pledgeRedirect(amount);
      };

      // Track Create Fundraiser Click
      scope.fundraiserCreateRedirect = function (team) {
         // mixpanel track event
        $analytics.startFundraiserDraft(team.id, { type: "admin_dropdown"});
        $location.path("teams/"+team.slug+"/fundraisers/new");
      };

      /*****************************
       * All Team Backers
       * */

      scope.$watch('team', function(team) {
        if (team) {
          $api.v2.backers({
            team_id: team.id,
            order: '+amount',
            per_page: 100
          }).then(function(response) {
            scope.backers = angular.copy(response.data);
          });
        }
      });

      /*****************************
       * New Update (if owner of active fundraiser)
       * */

      scope.showNewUpdateModal = function() {
        var parentScope = scope;

        scope.$watch('activeFundraiser', function(fundraiser) {
          $modal.open({
            templateUrl: 'app/fundraisers/templates/newUpdateModal.html',
            backdrop: true,
            controller: function($scope, $window, $cookieStore, $api, $modalInstance) {
              $scope.fundraiser = angular.copy(parentScope.fundraiser);

              $scope.cookieName = 'fr' + fundraiser.id + 'newUpdate';

              $scope.newUpdate = {
                title: ($cookieStore.get($scope.cookieName) || {}).title,
                body: ($cookieStore.get($scope.cookieName) || {}).body
              };

              $scope.close = function() {
                $modalInstance.dismiss();
              };

              $scope.discard = function() {
                if ($window.confirm("Discard update?")) {
                  $cookieStore.remove($scope.cookieName);
                  $scope.close();
                }
              };

              $scope.publishUpdate = function() {
                if ($window.confirm("Publish update?")) {
                  var payload = angular.copy($scope.newUpdate);

                  $api.v2.createFundraiserUpdate(fundraiser.id, payload).then(function(response) {
                    if (response.status === 201) {
                      // Append to `fundraiser.updates` if present on parentScope
                      if (parentScope.fundraiser && parentScope.fundraiser.updates) {
                        parentScope.fundraiser.updates.push(angular.copy(response.data));
                      }

                      // Append to `updates` if present on parentScope
                      if (parentScope.updates) {
                        parentScope.updates.push(angular.copy(response.data));
                      }

                      $cookieStore.remove($scope.cookieName);
                      $modalInstance.close();
                    } else {
                      $scope.alert = { type: 'danger', message: response.data.error };
                    }
                  });
                }
              };

              $scope.saveUpdateToCookie = function() {
                $cookieStore.put($scope.cookieName, $scope.newUpdate);
              };
            }
          });
        });
      };
    }
  };
});
