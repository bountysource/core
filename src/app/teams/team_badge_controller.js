'use strict';

angular.module('teams').controller('TeamBadgeController', function ($rootScope, $scope, $modal, $window) {

  var $parentScope = $scope;

  $scope.showBadgeModal = function () {
    $modal.open({
      templateUrl: 'app/teams/team_badge_modal.html',
      controller: function ($scope, $modalInstance) {
        $scope.team = $parentScope.team;
        $scope.close = $modalInstance.dismiss;

        $scope.frontend_url = $window.location.protocol+'//'+$window.location.host+'/teams/'+$scope.team.slug;

        $scope.bountiesBadgeUrl = $rootScope.api_host+'badge/team.svg?id='+$scope.team.id+'&type=bounties';
        $scope.bountiesBadgeHtml = '<a href="'+$scope.frontend_url+'"><img src="'+$scope.bountiesBadgeUrl+'" /></a>';
        $scope.bountiesBadgeMarkdown = '![Bountysource]('+$scope.bountiesBadgeUrl+')';
        $scope.bountiesBadgeBbcode = '[img]'+$scope.bountiesBadgeUrl+'[/img]';

        $scope.moneyRaisedBadgeUrl = $rootScope.api_host+'badge/team.svg?id='+$scope.team.id+'&type=raised';
        $scope.moneyRaisedBadgeHtml = '<a href="'+$scope.frontend_url+'"><img src="'+$scope.moneyRaisedBadgeUrl+'" /></a>';
        $scope.moneyRaisedBadgeMarkdown = '![Bountysource]('+$scope.moneyRaisedBadgeUrl+')';
        $scope.moneyRaisedBadgeBbcode = '[img]'+$scope.moneyRaisedBadgeUrl+'[/img]';
      }
    });
  };

});
