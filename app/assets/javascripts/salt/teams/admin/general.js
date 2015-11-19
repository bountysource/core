angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.teams.admin.general', {
    url: "/teams/{slug}/admin/general",
    templateUrl: "salt/teams/admin/general.html",
    container: false,
    controller: function($scope, $state, $timeout, $api) {
      $scope.form_data = {
        subtitle: $scope.team.support_offering.subtitle,
        youtube_video_url: $scope.team.support_offering.youtube_video_url,
        body_markdown: $scope.team.support_offering.body_markdown,
        extra: $scope.team.support_offering.extra
      };

      $scope.submit_form = function() {
        $scope.saving_form = true;
        $api.teams.update({ slug: $scope.team.slug }, { support_offering: $scope.form_data }, $state.reload);
      };

      // update markdown preview after slight delay
      ($scope.update_preview = function() {
        $scope.markdown_preview = ($scope.form_data.body_markdown||'').replace(/^#/,'###').replace(/\n#/g,'\n###');
      })();
      $scope.$watch('form_data.body_markdown', function() {
        if ($scope.preview_promise) {
          $timeout.cancel($scope.preview_promise);
        }
        $scope.preview_promise = $timeout($scope.update_preview, 500);
      });

    }
  });
});
