'use strict';

angular.module('app')
  .controller('IssueRequestForProposalsController', function ($scope, $routeParams, $window, $api, $log, Issue, RequestForProposal) {

    $scope.resolved = false;

    // Find existing RequestForProposal, or build a new
    // instance so that person can submit one (if they are authorized to).
    $scope.requestForProposal.$promise
      .then(function (requestForProposal) {
        // Success!
        // The RequestForProposal exists, assign it to $scope.
        $scope.resolved = true;
        return requestForProposal;

      }).catch(function (response) {
        $scope.resolved = true;

        // Error callback.
        // Create a new instance of RequestForProposal.
        if (response.status === 404) {
          $scope.requestForProposal = new RequestForProposal({ issue_id: $routeParams.id });
        } else {
          $log.error('Unexpected!');
        }
      });

    $scope.showDueDatePicker = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.dueDatePickerOpened = true;
    };

    $scope.create = function () {
      if ($window.confirm("Are you sure?")) {
        $scope.requestForProposal.$save(function () {
          $scope.requestForProposal.$get({ include_team: true });
        });
      }
    };

    /*
    * Is the current person authorized to create RFPs?
    * */
    $scope.canCreateRfp = function () {

      return true;

    };
  });