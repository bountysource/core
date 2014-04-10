'use strict';

angular.module('app').controller('NewEventController', function($scope, $location, $api) {

  $scope.newEvent = {
    slug: undefined,
    title: undefined,
    subtitle: undefined,
    url: undefined,
    issue_ids: undefined
  };

  $scope.createEvent = function() {
    var payload = angular.copy($scope.newEvent);

    $api.v2.createEvent(payload).then(function() {
      $location.url('/events/'+payload.slug);
    });
  };

});
