'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/teams/:id/activity', {
        templateUrl: 'pages/teams/activity.html',
        controller: 'BaseTeamController',
        trackEvent: 'View Team Activity'
      });
  })
  .controller('TeamActivityController', function ($scope, $routeParams, $api) {
    $scope.activities = $api.team_activity($routeParams.id).then(function(activity) {
      var activities = [];
      var i;
      for (i in activity.bounties) { activities.push(activity.bounties[i]); }
      for (i in activity.pledges) { activities.push(activity.pledges[i]); }
      for (i in activity.members) { activities.push(activity.members[i]); }
      return activities;
    });
  });