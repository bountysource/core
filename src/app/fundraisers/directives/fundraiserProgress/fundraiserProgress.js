'use strict';

angular.module('fundraisers').directive('fundraiserProgress', function($location, $analytics) {
  return {
    restrict: 'EAC',
    replace: true,
    templateUrl: 'app/fundraisers/directives/fundraiserProgress/templates/fundraiserProgress.html',
    scope: { fundraiser: '=' },
    link: function(scope) {

      // Track the event in Mixpanel
      scope.bigPledgeButtonClicked = function() {

        scope.$watch('fundraiser', function(fundraiser) {
          if (fundraiser) {
            $analytics.pledgeStart({ type: 'bigbutton' });
            $location.url('/fundraisers/' + fundraiser.slug + '/pledge');
          }
        });
      };

    }
  };
});
