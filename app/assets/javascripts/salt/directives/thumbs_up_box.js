angular.module('app').directive('thumbsUpBox', function ($api, $location, $auth) {
  return {
    restrict: 'E',
    templateUrl: 'salt/directives/thumbs_up_box.html',
    scope: {
      issue: '=',
      thumbsUpSize: '@'
    },
    replace: true,
    link: function (scope, element, attrs) {

      scope.thumbClicked = function(upvote) {
        if ($auth.person().id) {
          $api.thumbs.create({ issue_id: scope.issue.id, downvote: (upvote ? false : scope.issue.has_thumbed_up) }, function(response) {
            scope.issue.thumbs_up_count = response.thumbs_up_count;
            scope.issue.has_thumbed_up = response.has_thumbed_up;

            // HACKY HACKY... this is also set in the backend, really need to unify this logic
            if ((scope.issue.workflow_state === 'issue_open_new') && response.has_thumbed_up) {
              scope.issue.workflow_state = 'issue_open_thumbed';
            } else if ((scope.issue.workflow_state === 'issue_open_thumbed') && !response.has_thumbed_up) {
              scope.issue.workflow_state = 'issue_open_new';
            }
          });
        } else {
          console.log("TODO: GO LOG IN!");
          // $api.set_post_auth_url($location.url(), {}, "thumb:" + scope.issue.id);
          // $location.url("/signin");
        }
      };

      // console.log("TODO: GO LOG IN!");
      // if ($rootScope.postauth_action === 'thumb:' + scope.issue.id) {
      //   scope.thumbClicked(true);
      // }

    }
  };
});
