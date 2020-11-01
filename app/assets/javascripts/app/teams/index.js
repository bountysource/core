angular.module('app').controller('TeamsIndexController', function ($scope, $location, $routeParams, $anchorScroll, $api, $pageTitle, Team, Tag) {
  $pageTitle.set("Teams");

  $scope.tags = Tag.query({ featured: true, per_page: 10 });

  $scope.set_params = function(params) {
    var options = {
      include_bio: true,
      per_page: 10
    };

    if (!params.tag_id) {
      options.featured = true;
      $scope.selected = 'featured';
    } else if ((""+params.tag_id).match(/^\d+$/)) {
      options.tag_child_id = parseInt(params.tag_id);
      options.tag_child_type = 'Tag';
      $scope.team_self = null;
      $scope.selected = 'tag:'+options.tag_child_id;
    } else {
      options.tag_child_id = params.tag_id;
      options.tag_child_type = 'TeamSlug';
      $scope.team_self = Team.get({ slug: params.tag_id });
      $scope.selected = 'team:'+options.tag_child_id;
    }

    console.log(options);
    $scope.teams = Team.query(options);

    $anchorScroll();
  };

  // initial page load
  $scope.set_params({
    tag_id: $routeParams.tag_id
  });

});
