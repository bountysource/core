angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/teams', {
        templateUrl: 'admin/teams/index.html',
        controller: 'TeamsIndexController'
      });
  })
  .controller('TeamsIndexController', function ($scope, $api) {
    //THIS CONTROLLER PRODUCES A 'BOOLEAN IS NOT A FUCNTION ERROR' As of jan 27, 2014, can't find the reason

    // set up column attributes for applySort() function
    $scope.created_at = { title: "Created", col: "teams.created_at", order: "desc"};
    $scope.featured = { title: "Featured", col: "featured", order: "desc"};
    $scope.activity_total = { title: "Activity", col: "activity_total", order: "desc"};
    $scope.account_splits_total = { title: "Balance", col: "account_splits_total", order: "desc"};
    $scope.member_relations_count = { title: "Members", col: "member_relations_count", order: "desc"};
    $scope.tag_relations_count = { title: "Tags", col: "tag_relations_count", order: "desc"};

    $scope.updatePage = function(page, order_hash) {
      var params = { page: page, per_page: 100, order: order_hash};

      $scope.teams = [];
      $api.get_teams(params).then(function(response) {
        if (response.meta.success) {
          $scope.teams = response.data;
          console.table(response.data);

          // assign pagination variable to set attributes on pagination tag
          var pagination = response.meta.pagination;
          $scope.totalItems = pagination.items;
          $scope.currentPage = pagination.page  || 1;
          $scope.pageCount = Math.ceil(pagination.items/pagination.per_page);
          $scope.maxSize = 10;
        } else {
          $scope.error = response.data.error;
          //do something with the error  
        }
      });
    };

    $scope.applySort = function(page, column) {
      var order_hash = {};
//      if (column.order === "asc") {
//        column.order = "desc";
//      } else {
//        column.order = "asc";
//      }
      order_hash[column.col] = column.order;
      $scope.order_hash = order_hash;
      $scope.updatePage(page, order_hash);
    };

    // load default page
    $scope.applySort(1, $scope.activity_total);

    $scope.findCreator = function(team) {
      var members = team.members,
          first_member = members[0];
      for (var i = 0; i < members.length; i++) {  //loop through all the members of the team. assign creator status to first member
        if (members[i].added_at < first_member.added_at) {
          first_member = members[i];
        }
      }
      return first_member;
    };

    $scope.working = function (team) {
      if ($scope.in_progress && team === $scope.current_team) {
        return true;
      }
    };

    $scope.alert = function (team) {
      if (!$scope.in_progress && team === $scope.current_team) {
        return true;
      }
    };

    //setting intial column sort values
    // $scope.reverse = true;
    // $scope.sortCol = "created_at"

    // $scope.toggle = function (col) {
    //   $scope.sortCol = col
    //   if (col === "featured") {
    //     $scope.reverse = true;
    //   } else {
    //     $scope.reverse = !$scope.reverse
    //   }
    // }


    $scope.updateFeaturedAttribute = function (team) {
      $scope.current_team = team;
      $scope.in_progress = true;
      var form_data = {featured: team.featured};

      $api.update_team(team.id, form_data).then(function (response) {
        if (response) {
          $scope.in_progress = false;
        }
        
      });
    };
  });


