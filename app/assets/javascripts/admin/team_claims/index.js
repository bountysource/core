angular.module('app').config(function ($routeProvider) {
  $routeProvider.when('/admin/team_claims', {
    templateUrl: 'admin/team_claims/index.html',
    controller: function ($scope, $api, $window) {

      $scope.team_claims = $api.call('/admin/team_claims');

      $scope.acceptClaim = function(claim) {
        if (confirm("You sure?")) {
          $api.call('/admin/team_claims/'+claim.id, 'PUT', { accepted: true });
          $window.location.reload();
        }
      };

      $scope.rejectClaim = function(claim) {
        var reason = prompt("Rejection reason?");
        if (reason && reason.length > 0) {
          $api.call('/admin/team_claims/'+claim.id, 'PUT', { rejected: true, rejected_notes: reason });
          $window.location.reload();
        }
      };

    }
  });
});
