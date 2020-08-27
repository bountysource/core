angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/people/celebrities', {
        templateUrl: 'admin/people/celebrities.html',
        controller: "Celebrity"
      });
  })
  .controller("Celebrity", function ($scope, $window, $api) {

    $scope.maxSize = 10;
    $scope.date = { title: "Date", col: "created_at", order: "asc"};
    $scope.last_seen = {title: "Last Seen", col: "last_seen_at", order: "asc"};
    $scope.github_followers = {title: "Github Followers", col: "linked_accounts.followers", order: "desc"};
    $scope.twitter_followers = {title: "Twitter Followers", col: "twitter_accounts_people.followers", order: "asc"};

    $scope.fullName = function(person) {
      if (person.first_name === "(unknown)" && person.last_name === "(unknown)") {
        return "(unknown)";
      } else {
        return person.first_name + " " + person.last_name;
      }
    };

    $scope.updatePage = function(page, order_hash) {
      var params = { page: page, per_page: 25, order: order_hash};

      $api.get_celebrities(params).then(function(response) {
        $scope.celebrities = response.data;
        var pagination = response.meta.pagination;
        $scope.totalItems = pagination.items;
        $scope.itemsPerPage = pagination.per_page;
        $scope.currentPage = pagination.page || 1;
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
