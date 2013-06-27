'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/settings/email', {
        templateUrl: 'pages/settings/email.html',
        controller: 'SettingsEmail',
        resolve: $person
      });
  })
  .controller('SettingsEmail', function($scope, $routeParams, $api) {
    $scope.form_data = {
      email: $scope.current_person.email,
      weekly_newsletter: !$scope.current_person.exclude_from_newsletter
    }

    $scope.submit = function() {
      $scope.error = $scope.success = null;

      var updates = { email: $scope.form_data.email, exclude_from_newsletter: !$scope.form_data.weekly_newsletter };
      $api.person_put(updates).then(function(response) {
        if ($scope.current_person.email == $scope.form_data.email) {
          $scope.success = 'Email settings updated!';
        } else {
          $scope.error = 'Unable to update email settings!';
        }
      });
    };

  });

