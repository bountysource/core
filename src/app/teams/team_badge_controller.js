'use strict';

angular.module('teams').controller('TeamBadgeController', function ($rootScope, $scope, $modal, TeamBadgeBountiesPosted, TeamBadgeBountiesReceived, TeamBadgeRaised) {

  var $parentScope = $scope;
  
  $scope.$watch('fundraisers', function (fundraisers) {
    if (angular.isArray(fundraisers)) {
      if ($scope.fundraisers.length > 0) {
      $scope.badge = new TeamBadgeRaised($scope.team);
      } else {
      $scope.badge = new TeamBadgeBountiesReceived($scope.team);  
      }
    }
  });

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
