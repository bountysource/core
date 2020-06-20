angular.module('directives').directive('fundraiserTemplate', function($rootScope, $location, $routeParams, $modal, $api, $analytics, $cart) {

  return {
    restrict: 'EAC',
    replace: false,
    transclude: true,
    templateUrl: 'common/directives/fundraiserTemplate/fundraiserTemplate.html',
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


      /*****************************************
      * Top backers
      * */

      scope.$watch('fundraiser', function(fundraiser) {
        if (fundraiser) {
          $api.v2.pledges({
            fundraiser_id: scope.fundraiser.id,
            per_page: 10,
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
