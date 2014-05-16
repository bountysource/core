'use strict';

angular.module('teams').controller('TeamBadgeController', function ($rootScope, $scope, $modal, TeamBadgeBounties, TeamBadgeRaised) {

  var $parentScope = $scope;

  $scope.badgeBounties = new TeamBadgeBounties($scope.team);

  $scope.showBadgeModal = function () {
    $modal.open({
      templateUrl: 'app/teams/team_badge_modal.html',
      controller: function ($scope, $modalInstance) {
        $scope.badges = [
          new TeamBadgeBounties($parentScope.team),
          new TeamBadgeRaised($parentScope.team)
        ];

        $scope.close = $modalInstance.dismiss;
      }
    });
  };

});
