'use strict';

angular.module('fundraisers').directive('fundraiserShare', function() {
  return {
    restrict: 'EAC',
    templateUrl: 'app/fundraisers/directives/fundraiserShare/templates/fundraiserShare.html',
    scope: { fundraiser: '=' }
  };
});
