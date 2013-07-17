'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    //console.log($person);
    $routeProvider
      .when('/settings', {
        templateUrl: 'pages/settings/profile.html',
        controller: 'Settings',
        resolve: $person
      });
  })
  .controller('Settings', function($scope, $routeParams, $api, $location) {
    $scope.form_data = {
      first_name: $scope.current_person.first_name,
      last_name: $scope.current_person.last_name,
      display_name: $scope.current_person.display_name,
      bio: $scope.current_person.bio,
      location: $scope.current_person.location,
      company: $scope.current_person.company,
      url: $scope.current_person.url,
      public_email: $scope.current_person.public_email,
      gravatar_email: $scope.current_person.gravatar_email
    };

    $scope.profile_pics = [
      ($scope.current_person.github_account||{}).avatar_url,
      ($scope.current_person.twitter_account||{}).avatar_url,
      ($scope.current_person.facebook_account||{}).avatar_url
    ];

    $scope.save = function() {
      console.log($scope.form_data);
      $api.person_put($scope.form_data).then(function() {
        $location.url('/people/' + $scope.current_person.slug);
      });
    };
  });

