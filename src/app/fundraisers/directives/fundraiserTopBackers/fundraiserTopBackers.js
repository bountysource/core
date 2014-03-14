'use strict';

angular.module('fundraisers').directive('fundraiserTopBackers', function($api) {
  return {
    restrict: 'EAC',
    templateUrl: 'app/fundraisers/directives/fundraiserTopBackers/templates/fundraiserTopBackers.html',
    scope: { fundraiser: '=' },
    link: function(scope) {

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

    }
  };
});
