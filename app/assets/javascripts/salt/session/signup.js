angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.session.signup', {
    url: "/signup?access_token&status&reset_mixpanel_id&first_name&last_name&email&account_link_id&image_url&display_name&email_is_registered",
    title: "Sign Up",
    templateUrl: "salt/session/signup.html",
    controller: function($scope, $state, $stateParams, $api, $auth, person) {
      // data that eventually gets submitted to people create
      $scope.form_data = {
        terms: true
      };

      if ($stateParams.status === 'error_needs_account') {
        // because of the resolve below, we know we don't have an email if we got here
        $scope.signup_data = {
          image_url: $stateParams.image_url,
          display_name: $stateParams.display_name
        };

        // save this account id so it auto-links
        $scope.form_data.account_link_id = $stateParams.account_link_id;

        // first_name and last_name --> full_name
        if ($stateParams.first_name) {
          $scope.form_data.full_name = $stateParams.first_name + ($stateParams.last_name ? ' ' + $stateParams.last_name : '');
        }

        // hidden, but might as well pass it in
        if ($stateParams.display_name) {
          $scope.form_data.display_name = $stateParams.display_name;
        }

      } else if ($stateParams.status === 'error_already_linked') {
        $scope.error = "ERROR: Account already linked.";
      } else if ($stateParams.status === 'unauthorized') {
        $scope.error = "ERROR: Unauthorized.";
      }


      $scope.signup = function() {
        $scope.error = null;
        $api.people.create($scope.form_data, function(response) {
          $auth.setAccessToken(response.access_token);
          $auth.gotoTargetState();
        }, function(response) {
          if (response.data.error) {
            $scope.error = response.data.error;
          } else if (response.data.verify_email_send) {
            $scope.verify_email_send = true;
          }
        });
      };
    },

    resolve: {
      create_account_from_params: function($stateParams, $api, $auth) {
        if (($stateParams.status === 'error_needs_account') && $stateParams.email && ($stateParams.email_is_registered !== 'true')) {
          // NOTE: this is not DRY, copy-pasting from above
          var form_data = {
            terms: true,
            email: $stateParams.email,
            account_link_id: $stateParams.account_link_id,
            full_name: ($stateParams.first_name||'') + ($stateParams.last_name ? ' ' + $stateParams.last_name : ''),
            display_name: $stateParams.display_name
          };

          var resp = $api.people.create(form_data, function(response) {
            $auth.setAccessToken(response.access_token);
            $auth.gotoTargetState();
          });

          return resp.$promise;
        }
      }
    }
  });
});
