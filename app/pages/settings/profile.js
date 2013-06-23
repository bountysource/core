'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    console.log($person);
    $routeProvider
      .when('/settings', {
        templateUrl: 'pages/settings/profile.html',
        controller: 'Settings',
        resolve: $person
      });
  })
  .controller('Settings', function($scope, $routeParams, $api) {
    $scope.form_data = {
      first_name: $scope.current_person.first_name,
      last_name: $scope.current_person.last_name,
      display_name: $scope.current_person.display_name,
      location: $scope.current_person.location,
      company: $scope.current_person.comapny,
      website: $scope.current_person.website,
      public_email_address: $scope.current_person.public_email_address
    };
  });

