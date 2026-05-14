angular.module('app').directive('reportButton', function ($modal, Report, $api) {
  return {
    restrict: 'E',
    scope: {
      targetType: '@',
      targetId: '@'
    },
    template: '<button class="report-btn" ng-click="openModal()" title="Report as spam or inappropriate">' +
              '<i class="fa fa-flag"></i> Report' +
              '</button>',
    link: function (scope) {
      scope.openModal = function () {
        $modal.open({
          templateUrl: 'issues/templates/report_modal.html',
          controller: 'ReportModalController',
          resolve: {
            targetType: function () { return scope.targetType; },
            targetId: function () { return scope.targetId; }
          }
        });
      };
    }
  };
});

angular.module('app').controller('ReportModalController', function ($scope, $modalInstance, Report, targetType, targetId, $window) {
  $scope.targetType = targetType;
  $scope.targetId = targetId;
  $scope.reasons = ['spam', 'harassment', 'inappropriate', 'duplicate', 'other'];
  $scope.selectedReason = 'spam';
  $scope.description = '';
  $scope.submitting = false;
  $scope.submitted = false;
  $scope.error = null;

  $scope.submit = function () {
    $scope.submitting = true;
    $scope.error = null;

    Report.create({
      target_type: $scope.targetType,
      target_id: $scope.targetId,
      reason: $scope.selectedReason,
      description: $scope.description
    }).$promise.then(function () {
      $scope.submitting = false;
      $scope.submitted = true;
    }).catch(function (response) {
      $scope.submitting = false;
      $scope.error = response.data.error || 'An error occurred while submitting the report.';
    });
  };

  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  };
});
