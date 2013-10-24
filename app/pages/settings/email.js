'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/settings/email', {
        templateUrl: 'pages/settings/email.html',
        controller: 'SettingsEmail',
        resolve: $person,
        title: 'Email'
      });
  })
  .controller('SettingsEmail', function($scope, $routeParams, $api) {
    $scope.form_data = {};

    $scope.$watch('current_person', function(person) {
      if (person) {
        $scope.form_data.email = person.email;
        $scope.form_data.weekly_newsletter = !person.exclude_from_newsletter;
        $scope.form_data.receive_developer_alerts = person.receive_developer_alerts;
      }
    });

    $scope.submit = function() {
      $scope.error = $scope.success = null;

      var updates = { email: $scope.form_data.email, exclude_from_newsletter: !$scope.form_data.weekly_newsletter, receive_developer_alerts: $scope.form_data.receive_developer_alerts };

      $api.person_put(updates).then(function() {
        if ($scope.current_person.email === $scope.form_data.email) {
          $scope.success = 'Email settings updated!';
        } else {
          $scope.error = 'Unable to update email settings!';
        }
      });
    };
  });

