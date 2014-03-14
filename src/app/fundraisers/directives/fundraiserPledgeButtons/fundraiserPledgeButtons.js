'use strict';

angular.module('fundraisers').directive('fundraiserPledgeButtons', function($location, $routeParams, mixpanelEvent) {
  return {
    restrict: 'EAC',
    templateUrl: 'app/fundraisers/directives/fundraiserPledgeButtons/templates/fundraiserPledgeButtons.html',
    scope: { fundraiser: '=' },
    link: function(scope) {
      scope.amount = undefined;
      // Go to the Pledge page for the fundraisers with the given amount
      scope.pledgeRedirect = function(fundraiser, amount) {
        amount = amount || scope.amount;
        if (angular.isNumber(amount) && fundraiser.published) {
          $location.path("/fundraisers/"+$routeParams.id+"/pledge").search({ amount: amount });

          mixpanelEvent.pledgeStart({ amount: amount, type: 'buttons' });
        }
      };

      scope.customPledgeRedirect = function(fundraiser, amount) {
        amount = amount || scope.amount;
        if (angular.isNumber(amount) && fundraiser.published) {
          $location.path("/fundraisers/"+$routeParams.id+"/pledge").search({ amount: amount });

          mixpanelEvent.pledgeStart({ amount: amount, type: 'custom' });
        }
      };
    }
  };
});
