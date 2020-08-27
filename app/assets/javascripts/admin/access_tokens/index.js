angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/access_tokens', {
        templateUrl: 'admin/access_tokens/index.html',
        controller: "AccessTokens"
      });
  })
  .controller("AccessTokens", function ($scope, $window, $api) {

    $scope.fullName = function(person) {
      if (person.first_name === "(unknown)" && person.last_name === "(unknown)") {
        return "(unknown)";
      } else {
        return person.first_name + " " + person.last_name;
      }
    };

    $scope.updatePage = function(page) {
      var params = { page: page, per_page: 25, paginate: true };

      $api.get_access_tokens(params).then(function(response) {
        $scope.access_tokens = response.data;
        var pagination = response.meta.pagination;
        $scope.totalItems = pagination.items;
        $scope.itemsPerPage = pagination.per_page || 1;
        $scope.currentPage = pagination.page;
        $scope.pageCount = Math.ceil(pagination.items/pagination.per_page);
      });
    };

    $scope.time_ago = function(start,end) {
      start = new Moment(start);
      end = new Moment(end);
      if (start < end) {
        var tmp = start;
        start = end;
        end = tmp;
      }
      if (start.diff(end, 'seconds') > 31557600) { return start.diff(end, 'years') + ' years'; }
      else if (start.diff(end, 'seconds') > 2592000) { return start.diff(end, 'months') + ' months'; }
      else if (start.diff(end, 'seconds') > 86400) { return start.diff(end, 'days') + ' days'; }
      else if (start.diff(end, 'seconds') > 3600) { return start.diff(end, 'hours') + ' hours'; }
      else { return start.diff(end, 'minutes') + ' minutes'; }
    };

    $scope.updatePage(1);

  });
