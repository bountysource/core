'use strict';

angular.module('app').controller('TeamActivityController', function ($scope, $routeParams, $api) {
  $api.team_activity($routeParams.id).then(function(activity) {
    var activities = [];
    var i;
    for (i in activity.bounties) { activities.push(activity.bounties[i]); }
    for (i in activity.pledges) { activities.push(activity.pledges[i]); }
    for (i in activity.members) { activities.push(activity.members[i]); }

    $scope.activities = activities;
    return activities;
  });
});
