'use strict';

angular.module('teams').controller('TeamBadgeController', function ($rootScope, $scope, $modal, TeamBadgeBountiesPosted, TeamBadgeBountiesReceived, TeamBadgeRaised) {

  var $parentScope = $scope;

  $scope.badgeBountiesPosted = new TeamBadgeBountiesPosted($scope.team);

  $scope.showBadgeModal = function () {
    $modal.open({
      templateUrl: 'app/teams/team_badge_modal.html',
      controller: function ($scope, $modalInstance) {
        $scope.badges = [
          new TeamBadgeBountiesPosted($parentScope.team),
          new TeamBadgeBountiesReceived($parentScope.team),
          new TeamBadgeRaised($parentScope.team)
        ];

        $scope.close = $modalInstance.dismiss;
      }
    });
  };

});
