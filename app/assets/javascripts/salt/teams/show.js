angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.teams.show', {
    url: "/teams/{slug}",
    templateUrl: "salt/teams/show.html",
    container: false,
    controller: function($rootScope, $scope, $sce, members) {
      $rootScope.title = "Support " + $scope.team.name + ": " + (($scope.team.support_offering.subtitle && $scope.team.support_offering.subtitle.length > 0) ? $scope.team.support_offering.subtitle : "Your help is needed!");
      $scope.members = members;

      $scope.markdown_preview = ($scope.team.support_offering.body_markdown||'');

      // http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
      var matches = ($scope.team.support_offering.youtube_video_url||'').match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/);
      if (matches && matches[7] && matches[7].length === 11) {
        $scope.youtube_video_url = $sce.trustAsResourceUrl('https://www.youtube.com/embed/'+matches[7]+'?rel=0&showinfo=0');
      }

    },
    resolve: {
      members: function($api, $stateParams) {
        return $api.team_members.query({ slug: $stateParams.slug }).$promise;
      }
    }
  });
});
