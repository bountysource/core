angular.module('app').
  config(function ($routeProvider) {
    $routeProvider.when('/admin/rfp', {
      templateUrl: 'admin/request_for_proposal/rfp.html',
      controller: 'RequestForProposalController'
    });
  }).

  controller('RequestForProposalController', function ($scope, $api) {
    $api.get_request_for_proposals().then(function(response) {
      $scope.rfps = angular.copy(response);
    });
  });