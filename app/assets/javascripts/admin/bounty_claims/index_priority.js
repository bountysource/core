angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/claims/priority', {
    templateUrl: 'admin/bounty_claims/index_priority.html',
    controller: "PriorityBountyClaims"
  });
})
.controller("PriorityBountyClaims", function ($scope, $window, $api) {
  
  // number of items to show in a page
  var itemsPerPage = 100;
  $scope.itemsPerPage = itemsPerPage;
  $scope.maxSize = 10; // number of pagination links to show

  $scope.updatePage = function(page){
    var params = {
      page: page,
      per_page: itemsPerPage,
      in_dispute_period: true // priority claims are claims within dispute period
    };

    $api.call('/admin/bounty_claims', params, function(response, _, headers){
      if (response.meta.success) {
        $scope.bounty_claims = response.data;

        // set pagination data
        $scope.currentPage = page;
        $scope.pageCount = headers('Total-pages');
      }
    });
  };

  $scope.updatePage(1);
});
