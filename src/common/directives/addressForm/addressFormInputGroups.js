'use strict';

angular.module('directives').directive('addressFormInputGroups', function($api, countries, usStates) {

  return {
    restrict: 'EAC',
    templateUrl: 'common/directives/addressForm/templates/addressFormInputGroups.html',
    replace: true,
    scope: { address: '=', form: '=' },
    link: function($scope) {
      $scope.countries = countries;
      $scope.usStates = usStates;
      $scope.uniqueId = (new Date()).getTime();
    }
  };

});
