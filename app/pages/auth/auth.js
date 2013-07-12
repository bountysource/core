"use strict";

angular.module('app')
  .config(function($routeProvider, $person) {
    $routeProvider
      .when("/auth/:provider/confirm", {
        templateUrl: "/pages/auth/auth.html",
        controller: "AuthConfirmController",
        resolve: $person
      });
  })
  .controller("AuthConfirmController", function($scope, $routeParams, $window, $location, $api) {
    $scope.provider = $routeParams.provider;
    console.log("auth confirm", $routeParams.provider);

    $scope.accept = function() {
      $scope.pending_connect = true;

      var connect_params = angular.copy($routeParams);
      delete connect_params.provider;

      $api.approve_connect($scope.provider, connect_params).then(function(response) {
        if (response.error) {
          $scope.error = response.error;
        } else {
          $scope.pending_connect = false;
          $scope.redirecting = true;

          $window.setTimeout(function() {
            $window.location = response.redirect_url;
          }, 1500);
        }
      });

//      setTimeout(function(){ $scope.pending_connect = false; }, 1000);
    };

    $scope.reject = function() {
      if ($routeParams.redirect_url) {
        $window.location = $routeParams.redirect_url;
      } else {
        $location.url("/");
      }
    };
  });