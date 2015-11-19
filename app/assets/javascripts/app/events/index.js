'use strict';

angular.module('app').controller('EventIndexController', function($scope, $api) {

  $api.v2.events().then(function(response) {
    $scope.events = angular.copy(response.data);
  });

});
