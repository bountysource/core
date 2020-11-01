angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/fundraisers', {
    templateUrl: 'admin/fundraisers/index.html',
    controller: "Fundraisers"
  });
})
.controller("Fundraisers", function ($scope, $window, $api) {

  $scope.date = {title: "Date", col: "created_at", order: "asc"};
  $scope.funding = { title: "Funding", col: "total_pledged", order: "asc"};
  $scope.funding_goal = {title: "Funding Goal", col: "funding_goal", order: "asc"};
  $scope.featured = { title: "Featured", col: "featured", order: "asc"};
  $scope.published = { title: "Published", col: "published", order: "asc"};


  $scope.updatePage = function(page, order_hash) {
    var params = { page: page, per_page: 25, order: order_hash};

    $scope.working = true;
    $api.get_fundraisers(params).then(function(response) {
      if (response.meta.success) {
        $scope.working = false;
        $scope.fundraisers = response.data;
        var pagination = response.meta.pagination;
        $scope.totalItems = pagination.items;
        $scope.itemsPerPage = pagination.per_page;
        $scope.currentPage = pagination.page  || 1;
        $scope.pageCount = Math.ceil(pagination.items/pagination.per_page);
        $scope.maxSize = 10;
      } else {
        $scope.working = false;
        $scope.error = response.data.error;
        //do something with the error  
      }
    });
  };

  $scope.applySort = function(page, column) {
    var order_hash = {};
    if (column.order === "asc") {
      column.order = "desc";
    } else {
      column.order = "asc";
    }
    order_hash[column.col] = column.order;
    $scope.order_hash = order_hash;
    $scope.updatePage(page, JSON.stringify(order_hash));
  };

  $scope.updatePage(1);

});
