'use strict';

angular.module('app').controller('SettingsEmail', function($scope, $routeParams, $api) {
  $scope.form_data = {};

  $scope.$watch('current_person', function(person) {
    if (person) {
      $scope.form_data.email = person.email;
      $scope.form_data.weekly_newsletter = !person.exclude_from_newsletter;
      $scope.form_data.receive_developer_alerts = person.receive_developer_alerts;
      $scope.form_data.receive_fundraiser_emails = person.receive_fundraiser_emails;
    }
  });

  $scope.submit = function() {
    $scope.alert = {};

    var payload = {
      email: $scope.form_data.email,
      exclude_from_newsletter: !$scope.form_data.weekly_newsletter,
      receive_developer_alerts: $scope.form_data.receive_developer_alerts,
      receive_fundraiser_emails: $scope.form_data.receive_fundraiser_emails
    };

    $api.person_update(payload).then(function(updated_person) {
      if (!updated_person.error) {
        $scope.alert = { type: 'success', message: 'Email settings updated!'};

        // Update cached person
        $api.set_current_person(updated_person);
      } else {
        $scope.alert = { type: 'danger', message: 'Unable to update email settings' };
      }
    });
  };
});
