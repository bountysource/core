'use strict';

angular.module('fundraisers').directive('fundraiserPledgeButtons', function() {
  return {
    restrict: 'EAC',
    templateUrl: 'app/fundraisers/directives/fundraiserPledgeButtons/templates/fundraiserPledgeButtons.html',
    scope: { fundraiser: '=' },
    link: function(scope) {
      // Go to the Pledge page for the fundraisers with the given amount
      scope.pledgeRedirect = function(fundraiser, amount) {
        scope.$watch('fundraiser', function(fundraiser) {
          if (fundraiser) {
            amount = amount || $scope.pledge.amount;

            if (angular.isNumber(amount) && fundraiser.published) {
              $location.path("/fundraisers/"+$routeParams.id+"/pledge").search({ amount: amount });
            }
          }
        });
      };
    }
  };
});
