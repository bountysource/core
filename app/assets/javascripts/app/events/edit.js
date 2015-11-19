'use strict';

angular.module('app').controller('EditEventController', function($scope, $routeParams, $location, $api) {

  $api.v2.event($routeParams.slug).then(function(response) {
    $scope.event = angular.copy(response.data);
    $scope.event.issue_ids = $scope.event.issue_ids.join(',');
  });

  $scope.updateEvent = function() {
    var payload = angular.copy($scope.event);

    $api.v2.updateEvent($routeParams.slug, payload).then(function() {
      $location.url('/events/'+$routeParams.slug);
    });
  };

});
