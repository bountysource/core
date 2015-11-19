'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/github_api_errors', {
        templateUrl: 'admin/github_api_errors/index.html',
        controller: "GithubApiErrorsController"
      });
  })
  .controller("GithubApiErrorsController", function ($scope, $window, $api) {
    $scope.errors = $api.call("/admin/github_api_errors").then(function(errors) {
      for (var i=0; i<errors.length; i++) {
        errors[i].request.path = errors[i].request.url.split("?")[0];
      }

      return errors;
    });

    $scope.toggle_error_audited = function(error) {
      $api.call("/admin/github_api_errors/"+error.id, "PUT", { audited: !error.audited }).then(function(updates) {
        console.log(updates);

        return updates;
      });
    };
  });
