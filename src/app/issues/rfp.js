'use strict';

angular.module('app')
  .controller('IssueRequestForProposalsController', function ($scope, $routeParams, $window, $api, $log, Issue, RequestForProposal, Tracker, Team) {

    // Find existing RequestForProposal, or build a new
    // instance so that person can submit one (if they are authorized to).
    $scope.issue.$promise.then(function (issue) {
      RequestForProposal.get({ issue_id: issue.id },
        // Success!
        // The RequestForProposal exists, assign it to $scope.
        function (requestForProposal) {
          $scope.requestForProposal = requestForProposal;
        },

        // Error callback.
        // Create a new instance of RequestForProposal.
        function (response) {
          if (response.status === 404) {
            $scope.requestForProposal = new RequestForProposal({ issue_id: $routeParams.id });
          } else {
            $log.error('Unexpected!');
          }
        }
      );
    });

    $scope.showDueDatePicker = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.dueDatePickerOpened = true;
    };

    $scope.create = function () {
      if ($window.confirm("Are you sure?")) {
        $scope.requestForProposal.$save(function (requestForProposal) {
          // Update the loaded Issue with the RFP
          $scope.requestForProposal = new RequestForProposal(requestForProposal);
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