angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.session', {
    params: {
      status: '@status',
      access_token: '@access_token'
    },
    abstract: true,
    template: '<ui-view/>',
    resolve: {
      previous_auth: function($stateParams, $auth, person) {
        if (person.id) {
          // person is already logged in, just stop now.
          $auth.gotoTargetState();

        } else if ($stateParams.status === 'linked') {
          // just returned from provider and there's already an account

          // if ($stateParams.reset_mixpanel_id) {
          //   $analytics.reset_mixpanel_distinct_id();
          // }

          $auth.setAccessToken($stateParams.access_token);
          $auth.gotoTargetState();
        }
      }
    }
  });
});
