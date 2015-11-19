angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/claims/priority', {
    templateUrl: 'admin/bounty_claims/index_priority.html',
    controller: "PriorityBountyClaims"
  });
})
.controller("PriorityBountyClaims", function ($scope, $window, $api) {

//set column sort models here!!
  var params = {per_page: 500};
  $scope.bounty_claims = $api.get_bounty_claims(params).then(function(response) {
    if (response.meta.success) {
      // for priority view, we render only claims in dispute period
      var filtered_data = [];
      for (var i = 0; i < response.data.length; i++) {
        if (response.data[i].in_dispute_period) {
          filtered_data.push(response.data[i]);
        }
      }
      return filtered_data;
    } else {
      return response.data.error;
    }
  });

});
