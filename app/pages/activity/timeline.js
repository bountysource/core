'use strict';

angular.module('app.controllers').controller('Activity', function($scope, $routeParams, $api, $pageTitle) {
  $pageTitle.set('Timeline', 'Activity');

  $api.person_activity($scope.current_person.id).then(function(timeline) {
    $scope.timeline = timeline;
    return timeline;
  });
});
