'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/people/:id', {
        templateUrl: 'pages/people/activity.html',
        controller: 'PeopleShow'
      });
  })
  .controller('PeopleShow', function ($scope, $routeParams, $api, $pageTitle) {
    $scope.person = $api.person_get($routeParams.id);

    $scope.person.then(function(person){
      $pageTitle.set(person.display_name, 'Profile');
    });

    $scope.timeline = $api.person_activity($routeParams.id).then(function(activity) {
      var timeline = [], i;

      for (i in activity.bounties) { timeline.push(activity.bounties[i]); }
      for (i in activity.pledges) { timeline.push(activity.pledges[i]); }
      for (i in activity.fundraisers) { timeline.push(activity.fundraisers[i]); }
      for (i in activity.teams) { timeline.push(activity.teams[i]); }

      // add sort date since the col is either added_at (teams) or created_at (everything else)
      for (i in timeline) {
        timeline[i].sort_date = timeline[i].added_at || timeline[i].created_at;
      }

      return timeline;
    });
  });

