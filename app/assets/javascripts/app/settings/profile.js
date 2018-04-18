angular.module('app').controller('Settings', function($scope, $routeParams, $api) {
  $scope.form_data = {
    email: $scope.current_person.email,
    first_name: $scope.current_person.first_name,
    last_name: $scope.current_person.last_name,
    display_name: $scope.current_person.display_name,
    bio: $scope.current_person.bio,
    location: $scope.current_person.location,
    company: $scope.current_person.company,
    url: $scope.current_person.url,
    public_email: $scope.current_person.public_email,
    image_url: $scope.current_person.image_url
  };

  // profile pictures
  $scope.profile_input = {
    radio: $scope.form_data.image_url
  };

  $scope.save = function() {
    $scope.error = null;
    if ($scope.profile_input.radio === 'custom') {
      $scope.form_data.image_url = $scope.profile_input.text;
    } else {
      $scope.form_data.image_url = $scope.profile_input.radio;
    }

    $api.person_update($scope.form_data).then(function(updated_person) {
      console.log(updated_person);
      if (updated_person.error) {
        $scope.error = updated_person.error;
      } else {
        if (updated_person.email === $scope.form_data.email) {
          $scope.success = 'Settings have been saved.';
        } else {
          $scope.success = "An email has sent to your account to verify email changed.";
        }

        // Update cached person
        $api.set_current_person(updated_person);
      }
    });
  };
});
