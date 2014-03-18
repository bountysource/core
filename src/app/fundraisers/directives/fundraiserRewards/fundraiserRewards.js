'use strict';

angular.module('fundraisers').directive('fundraiserRewards', function($api, $analytics) {
  return {
    restrict: 'EAC',
    templateUrl: 'app/fundraisers/directives/fundraiserRewards/templates/fundraiserRewards.html',
    scope: { fundraiser: '=' },
    link: function(scope) {
      scope.$watch('fundraiser', function(fundraiser) {
        if (fundraiser) {
          $api.v2.fundraiserRewards(fundraiser.id, {
            order: '-amount'
          }).then(function(response) {
            scope.rewards = angular.copy(response.data.slice(1,-1));
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
