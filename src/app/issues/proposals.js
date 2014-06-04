'use strict';

angular.module('app')
  .controller('IssueProposalsController', function ($scope, $routeParams, $window, $api, $log, Issue, RequestForProposal) {
    $scope.showDueDatePicker = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.dueDatePickerOpened = true;
    };
  });