'use strict';

angular.module('app').controller('IssueCreateController', function ($scope, $location, $api, $pageTitle) {
  $pageTitle.set('Add Issue');

  $scope.new_issue = {};

  // don't show initial validations until form has been submitted
  $scope.show_validations = false;

  $scope.create_issue = function() {
    $scope.show_validations = true;
    $scope.error = null;
    $api.issue_create($scope.new_issue, function(response) {
      if (response.meta.success) {
        $location.url("/issues/"+response.data.slug).replace();
      } else {
        $scope.error = response.data.error;
      }
    });
  };
});
