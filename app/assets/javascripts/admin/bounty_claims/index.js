angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/claims', {
    templateUrl: 'admin/bounty_claims/index.html',
    controller: "BountyClaims"
  });
})
.controller("BountyClaims", function ($scope, $window, $api) {

//set column sort models here!!
  var params = {per_page: 500};
  $scope.bounty_claims = $api.get_bounty_claims(params).then(function(response) {
    if (response.meta.success) {
      return response.data;
    } else {
      return response.data.error;
    }
  });

});
