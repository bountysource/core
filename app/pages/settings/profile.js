'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    //console.log($person);
    $routeProvider
      .when('/settings', {
        templateUrl: 'pages/settings/profile.html',
        controller: 'Settings',
        resolve: $person,
        title: 'Bountysource - Profile'
      });
  })
  .controller('Settings', function($scope, $routeParams, $api) {
    $scope.form_data = {
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

      $api.person_put($scope.form_data).then(function(response) {
        if (response.error) {
          $scope.error = response.error;
        } else {
          $scope.success = 'Settings have been saved.';
        }
      });
    };
  });

