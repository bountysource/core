'use strict';

angular.module('app').controller('IssueBadgeController', function ($rootScope, $scope, $modal, $window) {

  var $parentScope = $scope;

  $scope.showBadgeModal = function () {
    $modal.open({
      templateUrl: 'app/issues/templates/issue_badge_modal.html',
      controller: function ($scope, $modalInstance) {
        $scope.issueBadge = $parentScope.issueBadge;
        $scope.close = $modalInstance.dismiss;
      }
    })
  };

});
