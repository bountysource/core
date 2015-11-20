angular.module('directives').directive('thumbsUpBox', function ($api, $location, $rootScope, Thumb) {
  return {
    restrict: 'E',
    templateUrl: 'common/directives/thumbsUpBox/thumbsUpBox.html',
    scope: {
      issue: '=',
      thumbsUpSize: '@'
    },
    replace: true,
    link: function (scope, element, attrs) {

      scope.thumbClicked = function(upvote) {
        if ($rootScope.current_person) {
          Thumb.create({ issue_id: scope.issue.id, downvote: (upvote ? false : scope.issue.has_thumbed_up) }, function(response) {
            scope.issue.thumbs_up_count = response.thumbs_up_count;
            scope.issue.has_thumbed_up = response.has_thumbed_up;
          });
        } else {
          $api.set_post_auth_url($location.url(), {}, "thumb:" + scope.issue.id);
          $location.url("/signin");
        }
      };

      if ($rootScope.postauth_action === 'thumb:' + scope.issue.id) {
        scope.thumbClicked(true);
      }

    }
  };
});
