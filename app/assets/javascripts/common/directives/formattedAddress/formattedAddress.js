'use strict';

angular.module('directives').directive('formattedAddress', function() {
  return {
    restrict: 'EAC',
    templateUrl: 'common/directives/formattedAddress/formattedAddress.html',
    scope: { address: '=' }
  };
});