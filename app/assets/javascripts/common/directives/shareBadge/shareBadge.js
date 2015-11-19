'use strict';

angular.module('directives').directive('shareBadge', function ($api, $modal, IssueBadge) {
  return {
    restrict: "E",
    templateUrl: "common/directives/shareBadge/shareBadge.html",
    replace: true,
    scope: {
      badgeObject: '=',
      badgeType: '@'
    },
    link: function (scope, element, attrs) {

      //console.log(scope);
      if (scope.badgeType === 'issue') {
        scope.issueBadge = new IssueBadge(scope.badgeObject);

        scope.showBadgeModal = function () {
          $modal.open({
            templateUrl: 'common/directives/shareBadge/issue_badge_modal.html',
            controller: function ($scope, $modalInstance) {
              $scope.issueBadge = scope.issueBadge;
              $scope.close = $modalInstance.dismiss;
            }
          });
        };

      }

    }
  };
});
