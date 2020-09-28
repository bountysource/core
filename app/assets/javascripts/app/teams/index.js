angular
  .module("app")
  .controller("TeamsIndexController", function (
    $scope,
    $location,
    $routeParams,
    $anchorScroll,
    $api,
    $pageTitle,
    Team,
    Tag
  ) {
    var defaultOptions = {
      include_bio: true,
      per_page: 25,
      page: 1,
    };
    function initalLoad() {
      $pageTitle.set("Teams");
      $scope.tags = Tag.query({ featured: true, per_page: 250 });
      $scope.currentPage = 1;
      $scope.perPage = defaultOptions.per_page;
      $scope.set_params({
        tag_id: $routeParams.tag_id,
      });
    }
    $scope.changePage = function (page) {
      defaultOptions.page = page;
      defaultOptions.pagination = true;
      $api.v2.teamsPagination(defaultOptions).then((response) => {
        $scope.currentPage = page;
        $scope.totalItems = parseInt(response.headers()["total-items"], 10);
        $scope.teams = response.data;
      });
    };
 
    $scope.set_params = function (params) {
      var options = {
        include_bio: true,
        per_page: 25,
      };
      if (params.all) {
        $scope.selected = "all";
        $scope.currentPage = 1;
        defaultOptions.page = 1;
        defaultOptions.pagination = true;
        $api.v2.teamsPagination(defaultOptions).then((response) => {
          $scope.totalItems = parseInt(response.headers()["total-items"], 10);
          $scope.teams = response.data;
        });
      } else {
        if (!params.tag_id) {
          options.featured = true;
          $scope.selected = "featured";
        } else if (("" + params.tag_id).match(/^\d+$/)) {
          options.tag_child_id = parseInt(params.tag_id);
          options.tag_child_type = "Tag";
          $scope.team_self = null;
          $scope.selected = "tag:" + options.tag_child_id;
        } else {
          options.tag_child_id = params.tag_id;
          options.tag_child_type = "TeamSlug";
          $scope.team_self = Team.get({ slug: params.tag_id });
          $scope.selected = "team:" + options.tag_child_id;
        }
        $scope.teams = Team.query(options);
        $anchorScroll();
      }
    };
 
    initalLoad();
  });