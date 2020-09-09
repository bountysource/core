angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/bounties', {
    templateUrl: 'admin/bounties/index.html',
    controller: "Bounties"
  });
})
.controller("Bounties", function ($scope, $api) {

  $scope.amount = { title: "Amount", col: "amount", order: "asc"};
  $scope.created_at = { title: "Created", col: "created_at", order: "desc"};

  $scope.updatePage = function(page, order_hash) {
    var params = { page: page, per_page: 25, order: order_hash};

    $scope.working = true;

    $api.get_bounties(params).then(function(response) {
      if (response.meta.success) {
        $scope.working = false;
        $scope.bounties = response.data;
        var pagination = response.meta.pagination;
        $scope.totalItems = pagination.items;
        $scope.itemsPerPage = pagination.per_page;
        $scope.currentPage = pagination.page  || 1;
        $scope.pageCount = Math.ceil(pagination.items/pagination.per_page);
        $scope.maxSize = 10;

        for (var i=0; i<response.data.length; i++) {
          response.data[i].$acknowledged = !!response.data[i].acknowledged_at;
        }
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

  $scope.toggle_acknowledged = function(bounty) {
    if (bounty.$acknowledged) {
      $api.acknowledge_bounty(bounty.id);
    } else {
      $api.unacknowledge_bounty(bounty.id);
    }
  };
});
