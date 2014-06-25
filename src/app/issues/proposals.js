'use strict';

angular.module('app')
  .controller('IssueProposalsController', function ($scope, $window, $routeParams, $modal, Proposal) {
    $scope.showDueDatePicker = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.dueDatePickerOpened = true;
    };

    $scope.showProposalModal = function (proposal) {
      $modal.open({
        templateUrl: 'app/issues/templates/proposal_show_modal.html',
        controller: function ($scope, $modalInstance) {
          $scope.proposal = proposal;

          $scope.close = function () {
            $modalInstance.dismiss('cancel');
          };
        }
      });
    };
    
    $scope.acceptProposal = function (proposal) {
      if ($window.confirm('Are you sure?')) {
        proposal.$accept(function () {
          $scope.proposals = Proposal.query({ issue_id: $routeParams.id, include_person: true });
        });
      }
    };

    $scope.rejectProposal = function (proposal) {
      if ($window.confirm('Are you sure?')) {
        proposal.$reject(function () {
          $scope.proposals = Proposal.query({ issue_id: $routeParams.id, include_person: true });
        });
      }
    };
  });