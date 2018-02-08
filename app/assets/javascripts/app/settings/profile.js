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

  $scope.avatars = ["somecat_asunu9.png", "snake_u4dgtd.png", "pig_dfcnhd.png", "panther_icp2bi.png", "panda_sdu77u.png", "monkey_bmcetd.png", "lion_wsmfjz.png", "leaf_x9n8db.png", "koala_x1a7sj.png", "grasshopper_xlfeu8.png", "goat_oxsdh2.png", "frog_zzcmuy.png", "fox_byssge.png", "duck_exyai1.png", "cow_ricpqp.png", "chick_aggmvs.png", "bear_uonphf.png", "mouse_lwqixo.png"]
  // profile pictures

  $scope.cloudinary_url = "https://cloudinary-a.akamaihd.net/bountysource/image/"
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
        $scope.success = 'Settings have been saved.';

        // Update cached person
        $api.set_current_person(updated_person);
      }
    });
  };
});
