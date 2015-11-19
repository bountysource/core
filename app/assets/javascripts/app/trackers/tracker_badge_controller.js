angular.module('app').controller('TrackerBadgeController', function ($rootScope, $scope, $modal) {

  var $parentScope = $scope;

  $scope.showBadgeModal = function () {
    $modal.open({
      templateUrl: 'app/trackers/templates/tracker_badge_modal.html',
      controller: function ($scope, $modalInstance) {
        $scope.trackerBadge = $parentScope.trackerBadge;
        $scope.close = $modalInstance.dismiss;
      }
    });
  };

});
