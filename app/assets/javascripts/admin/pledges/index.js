angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/pledges', {
    templateUrl: 'admin/pledges/index.html',
    controller: "Pledges"
  });
})
.controller("Pledges", function ($scope, $window, $api) {

  $scope.amount = {title: "Amount", col: "amount", order: "asc"};
  $scope.created = { title: "Created", col: "created_at", order: "asc"};

  $scope.updatePage = function(page, order_hash) {
    var params = { page: page, per_page: 10, order: order_hash};

    $scope.working = true;
    $api.get_pledges(params).then(function(response) {
      if (response.meta.success) {
        $scope.working = false;
        $scope.pledges = response.data;
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
