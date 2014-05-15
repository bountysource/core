'use strict';

angular.module('app').controller('IssueBadgeController', function ($rootScope, $scope, $modal) {

  var $parentScope = $scope;

  $scope.showBadgeModal = function () {
    $modal.open({
      templateUrl: 'app/issues/templates/issue_badge_modal.html',
      controller: function ($scope, $modalInstance) {
        $scope.issue = $parentScope.issue;
        $scope.close = $modalInstance.dismiss;

        $scope.badgeHtml = '<a href="https://www.bountysource.com/issues/'+$scope.issue.slug+'"><img src="'+$rootScope.api_host+'badge/issue.svg?id='+$scope.issue.id+'" /></a>';
        $scope.badgeMarkdown = '![Bountysource]('+$rootScope.api_host+'badge/issue.svg?id='+$scope.issue.id+')';
      }
    })
  };

});
