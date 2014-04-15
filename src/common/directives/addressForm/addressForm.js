'use strict';

angular.module('directives').directive('addressForm', function($api, countries, usStates) {

  return {
    restrict: 'EAC',
    templateUrl: 'common/directives/addressForm/templates/addressForm.html',
    replace: true,
    scope: { address: '=' },
    link: function($scope) {
      $scope.countries = countries;
      $scope.usStates = usStates;
    }
  };

});
