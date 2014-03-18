'use strict';

/*
* Options:
*
* pledgeButtons - show the pledge buttons
* topBackers - show the top 3 backers of the fundraiser
* author - show the author of the fundraiser
* progress - show the progress info
* rewards - show the rewards
* shareButtons - show the share buttons. such social
* */
angular.module('directives').directive('fundraiserSideBar', function($api, $location, $modal, $analytics) {
  return {
    restrict: 'EAC',
    templateUrl: 'common/directives/fundraiserSideBar/templates/fundraiserSideBar.html',
    scope: {
      fundraiser: '=',
      options: '='
    },
    replace: true,
    link: function(scope) {
      scope.$options = {
        pledgeButtons: true,
        topBackers: true,
        author: true,
        progress: true,
        rewards: true,
        shareButtons: true
      };

      // Merge default options with those specified by the developer
      if (angular.isObject(scope.options)) {
        angular.extend(scope.$options, scope.options);
      }

      // Watch Fundraiser object for Team. Fetch members if they are not present on the object.
      scope.$watch('fundraiser.team', function(team) {
        if (team && !team.members) {
          $api.team_members_get(team.slug).then(function(members) {
            scope.fundraiser.team.members = angular.copy(members);
            return members;
          });
        }
      });

      // Publish a fundraiser
      scope.publishFundraiser = function(fundraiser) {
        return $api.fundraiser_publish(fundraiser.id, function(response) {
          if (response.meta.success) {
            $location.url("/fundraisers/"+fundraiser.slug);
          } else {
            scope.error = "ERROR: " + response.data.error;
          }
          return response.data;
        });
      };

      // Go to the Pledge page for the fundraiser and prefill the amount with the given value.
      scope.pledgeRedirect = function(fundraiser, amount) {
        console.log('pledgeRedirect', fundraiser, amount);

        if (angular.isNumber(amount) && fundraiser.published) {
          $location.path("/fundraisers/"+fundraiser.id+"/pledge").search({ amount: amount });
        }
      };

      // Track reward click in Mixpanel
      scope.rewardClicked = function(reward) {
        $analytics.pledgeStart(
          {
            amount: reward.amount,
            id:     reward.id,
            type:   "reward"
          }
        );
      };

      // If the Fundraiser create, show a modal to send a new update to backers.
    }
  };
});