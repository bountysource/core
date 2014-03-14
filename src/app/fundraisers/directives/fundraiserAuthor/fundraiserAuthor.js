'use strict';

angular.module('fundraisers').directive('fundraiserAuthor', function() {
  return {
    restrict: 'EAC',
    templateUrl: 'app/fundraisers/directives/fundraiserAuthor/templates/fundraiserAuthor.html',
    scope: { fundraiser: '=' }
  };
});
