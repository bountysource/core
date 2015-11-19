angular.module('app').controller('NewTeamController', function ($scope, $location, $api, $filter, $routeParams, $pageTitle, $window, $timeout, $modal, Team) {
  $pageTitle.set("Teams", "New");

  $scope.link_with_github = function() {
    $api.set_post_auth_url($location.url());
    $window.location = $api.signin_url_for('github');
  };

  $scope.claim_team = function(team, request_invite) {
    Team.update({ slug: team.slug, claim: true, request_invite: request_invite }, function(response) {
      if (response.claim === 'success') {
        if ($routeParams.salt) {
          $window.location.href = 'https://salt.bountysource.com/teams/' + team.slug;
        } else {
          $location.path('/teams/' + team.slug);
        }
      } else if (response.claim === 'request_invite') {

        var inviteScope = $scope.$new(true);
        inviteScope.team = team;
        inviteScope.request_invite = function() {
          $scope.claim_team(team, true);
        };

        $scope.invite_modal = $modal.open({
          templateUrl: 'app/teams/_new_team_request_invite.html',
          scope: inviteScope
        });
      } else if (response.claim === 'pending') {
        $scope.invite_modal.dismiss();
      }
    });
  };

  var refresh_teams = function() {
    $scope.loading_teams = true;
    Team.query({ my_teams_and_suggestions: true }, function(response, responseHeaders) {
      $scope.teams = response;
      var retry_after = parseInt(responseHeaders('x-api-retry-after'));
      if (retry_after > 0) {
        $timeout(refresh_teams, retry_after*1000);
      } else {
        $scope.loading_teams = false;
      }
    });
  };
  refresh_teams();

});
