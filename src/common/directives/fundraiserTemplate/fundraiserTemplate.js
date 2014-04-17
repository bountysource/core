'use strict';

angular.module('directives').directive('fundraiserTemplate', function($rootScope, $location, $routeParams, $modal, $api, $analytics, $cart) {

  return {
    restrict: 'EAC',
    replace: false,
    transclude: true,
    templateUrl: 'common/directives/fundraiserTemplate/templates/fundraiserTemplate.html',
    scope: {
      options: '=',
      fundraiser: '='
    },
    link: function(scope) {

      scope.defaultOptions = {
        showLeftColumn: true,
        showRightColumn: true,
        showTitle: true,
        showNavTabs: true,
        showProgress: true,
        showAuthor: true,
        showShareButtons: true,
        showManageButtons: true,
        showPledgeButtons: true,
        showTopBackers: true,
        showRewards: true
      };

      scope._options = angular.extend(scope.defaultOptions, scope.options||{});

      /*****************************************
       * Navigation tabs
       * */

      scope.activeNavTab = function(name) {
        if (name === 'overview' && (/^\/fundraisers\/[a-z-_0-9]+$/i).test($location.path())) { return "active"; }
        if (name === 'updates' && (/^\/fundraisers\/[a-z-_0-9]+\/updates(?:\/\d+)?$/i).test($location.path())) { return "active"; }
        if (name === 'backers' && (/^\/fundraisers\/[a-z-_0-9]+\/backers$/i).test($location.path())) { return "active"; }
        if (name === 'rewards' && (/^\/fundraisers\/[a-z-_0-9]+\/rewards$/i).test($location.path())) { return "active"; }
        if (name === 'pledge_now' && (/^\/fundraisers\/[a-z-_0-9]+\/pledge$/i).test($location.path())) { return "active"; }
      };

      scope.navTabClicked = function () {
        $analytics.pledgeStart({ type: "tab" });
      };


      /*****************************************
      * Fundraiser progress
      * */

      // Track the event in Mixpanel
      scope.bigPledgeButtonClicked = function() {

        scope.$watch('fundraiser', function(fundraiser) {
          if (fundraiser) {
            $analytics.pledgeStart({ type: 'bigbutton' });
            $location.url('/fundraisers/' + fundraiser.slug + '/pledge');
          }
        });
      };


      /*****************************************
      * Manage Fundraiser
      * */

      scope.can_manage = false;
      scope.publishable = false;

      scope.$watch('fundraiser', function(fundraiser) {
        $rootScope.$watch('current_person', function(person) {
          //isolated scope. Need to define current_person
          scope.current_person = person;
          if (fundraiser && fundraiser.person && person) {
            scope.can_manage = fundraiser.person.id === person.id;
            scope.publishable = fundraiser.title && fundraiser.short_description && fundraiser.funding_goal && fundraiser.description;
          }
        });
      });

      // Publish a fundraiser
      scope.publishFundraiser = function(fundraiser) {
        return $api.fundraiser_publish(fundraiser.id, function(response) {
          if (response.meta.success) {
            // replace cached copy of fundraiser with the now published one
            scope.fundraiser = angular.copy(response.data);
            // Mixpanel track publish event
            $analytics.publishFundraiser(fundraiser.team.id, fundraiser.id);
            $location.url("teams/"+fundraiser.team.slug+"/fundraiser");
            // $location.url("/fundraisers/"+fundraiser.slug);
          } else {
            scope.error = response.data.error.join(", ");
          }
          return response.data;
        });
      };

      scope.showNewUpdateModal = function() {
        var parentScope = scope;

        $modal.open({
          templateUrl: 'app/fundraisers/templates/newUpdateModal.html',
          backdrop: true,
          controller: function($scope, $window, $cookieStore, $api, $modalInstance) {
            $scope.fundraiser = angular.copy(parentScope.fundraiser);

            $scope.cookieName = 'fr' + $scope.fundraiser.id + 'newUpdate';

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

                $api.v2.createFundraiserUpdate($scope.fundraiser.id, payload).then(function(response) {
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
      };



      /*****************************************
      * Pledge buttons
      * */

      scope.amount = undefined;

      // Go to the Pledge page for the fundraisers with the given amount
      scope.pledgeRedirect = function(fundraiser, amount) {
        amount = amount || scope.amount;
        if (angular.isNumber(amount) && fundraiser.published) {
          $location.path("/fundraisers/"+$routeParams.id+"/pledge").search({ amount: amount });

          $analytics.pledgeStart({ amount: amount, type: 'buttons' });
        }
      };


      scope.customPledgeRedirect = function(fundraiser, amount) {
        amount = amount || scope.amount;
        if (angular.isNumber(amount) && fundraiser.published) {
          $location.path("/fundraisers/"+$routeParams.id+"/pledge").search({ amount: amount });

          $analytics.pledgeStart({ amount: amount, type: 'custom' });
        }
      };


      /*****************************************
      * Top backers
      * */

      scope.$watch('fundraiser', function(fundraiser) {
        if (fundraiser) {
          $api.v2.pledges({
            fundraiser_id: scope.fundraiser.id,
            per_page: 3,
            order: 'amount',
            include_owner: true
          }).then(function(response) {
            scope.pledges = angular.copy(response.data);
          });
        }
      });


      /*****************************************
      * Rewards
      * */

      scope.$watch('fundraiser', function(fundraiser) {
        if (fundraiser) {
          $api.v2.fundraiserRewards(fundraiser.id, {
            order: '-amount'
          }).then(function(response) {
            scope.rewards = angular.copy(response.data.slice(1));
          });
        }
      });

      scope.rewardClicked = function (reward) {
        $analytics.pledgeStart(
          {
            amount: reward.amount,
            id:     reward.id,
            type:   "reward"
          }
        );
      };

    }
  };

});
