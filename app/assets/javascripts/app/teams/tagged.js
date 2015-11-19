'use strict';

angular.module('app').controller('TeamTaggedController', function ($scope, $location, $routeParams, $anchorScroll, $api, $pageTitle, Team) {
  $scope.team_promise.then(function(team) {
    $scope.teams = Team.query({ tag_child_type: 'Team', tag_child_id: team.id, per_page: 250, include_bio: true });
  });
});
