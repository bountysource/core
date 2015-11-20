angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/searches', {
        templateUrl: 'admin/searches/searches.html',
        controller: "Search"
      });
  })
  .controller("Search", function ($scope, $window, $api) {

    $scope.popular_searches = $api.get_popular_searches().then(function(data) {
      var top_10 = data.slice(0,10);
      return top_10;
    });

    $scope.query = { title: "Query", order: "asc", col: "query"};
    $scope.searched_on = { title: "Searched On", order: "desc", col: "created_at"};
    $scope.person = { title: "Person", order: "asc", col: "person_id"};
    $scope.maxSize = 10;

    $scope.updatePage = function(page, order_hash) {
      var params = { page: page, per_page: 100, order: order_hash};

      $api.get_searches(params).then(function(searches) {
        $scope.all_searches = searches.data;
        var pagination = searches.meta.pagination;
        $scope.totalItems = pagination.items;
        $scope.currentPage = pagination.page;
        $scope.itemsPerPage = pagination.per_page;
        $scope.pageCount = Math.ceil(pagination.items/pagination.per_page);
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
