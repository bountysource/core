'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/signin', {
        templateUrl: 'pages/signin/index.html',
        controller: 'Signin'
      });
  })
  .controller('Signin', function ($scope, $routeParams, $api) {
    $scope.providers = [
      { id: 'github', name: 'GitHub', image_url: 'images/favicon-github.png' },
      { id: 'twitter', name: 'Twitter', image_url: 'images/favicon-twitter.png' },
      { id: 'facebook', name: 'Facebook', image_url: 'images/favicon-facebook.png' }
    ];

    $scope.submit = function() {
      $api.signin($scope.email, $scope.password);
    };

    $scope.signin_url_for = $api.signin_url_for;
    $scope.signout = $api.signout;
  });


