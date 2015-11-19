angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/team_payins', {
    templateUrl: 'admin/team_payins/index.html',
    controller: "TeamPayins"
  });
})
.controller("TeamPayins", function ($scope, $api) {

  $scope.team_payins = $api.call("/admin/team_payins");

});
