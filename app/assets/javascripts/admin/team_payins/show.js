angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/team_payins/:id', {
    templateUrl: 'admin/team_payins/show.html',
    controller: "TeamPayinShow"
  });
})
.controller("TeamPayinShow", function ($scope, $api, $routeParams) {
  $scope.team_payin = $api.call("/admin/team_payins/" + $routeParams.id);
  $scope.team_payin.then(function() {
    $scope.team_payins = [$scope.team_payin];
  });

  $scope.refund = function() {
    if (confirm("Are you sure you want to refund this team payin?")) {
      $scope.team_payin = null;
      $scope.team_payins = [];
      $scope.team_payin = $api.call("/admin/team_payins/" + $routeParams.id, 'PUT', { refunded: true }).then(function(team_payin) {
        $scope.team_payin = team_payin;
        $scope.team_payins = [team_payin];
      })
    }
  };
});
