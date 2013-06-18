'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id/edit', {
        templateUrl: 'pages/fundraisers/edit.html',
        controller: 'FundraiserEditController'
      });
  })

  .controller('FundraiserEditController', function($scope, $routeParams, $location, $api) {
    // initialize fundraiser data and changes
    $scope.master = {};
    $scope.changes = {};

    $scope.fundraiser = $api.fundraiser_get($routeParams.id).then(function(response) {
      // cache the fundraiser. angular.copy does a deep copy, FYI
      // if you don't create a copy, these are both bound to the input
      $scope.master = angular.copy(response);
      $scope.changes = angular.copy(response);

      return response;
    });

    $scope.cancel_all = function() {
      $location.path("/fundraisers/"+$scope.master.slug);
    };

    $scope.reset_header = function() {
      $scope.changes.title = $scope.master.title;
      $scope.changes.short_description = $scope.master.short_description;
    };

    $scope.reset_description = function() {
      $scope.changes.description = $scope.master.description;
      $scope.changes.description_html = $scope.master.description_html;
    };

    $scope.reset_all = function() {
      $scope.reset_header();
      $scope.reset_description();
    };

    $scope.alerts = [];
    $scope.close_alert = function(index) { $scope.alerts.splice(index, 1) };

    $scope.save_all = function() {
      $api.fundraiser_update($routeParams.id, $scope.changes).then(function(response) {
        // TODO proper error callback through the $q server `promise.reject(response)`
        if (response.error) {
          $scope.alerts.push({ type: 'error', msg: response.error });
        } else {
          $scope.alerts.push({ type: 'success', msg: "Fundraiser saved!" });
          $scope.master.description = response.description;
          $scope.master.description_html = response.description_html;
        }
        return response;
      });
    };

    $scope.can_save_all = function() { return !angular.equals($scope.changes, $scope.master) };

    $scope.header_alerts = [];
    $scope.close_header_alert = function(index) { $scope.header_alerts.splice(index, 1); };

    $scope.save_header = function() {
      var data = {
        title: $scope.changes.title,
        short_description: $scope.changes.short_description
      };
      $api.fundraiser_update($routeParams.id, data).then(function(response) {
        // TODO proper error callback through the $q server `promise.reject(response)`
        if (response.error) {
          $scope.header_alerts.push({ type: 'error', msg: response.error });
        } else {
          $scope.header_alerts.push({ type: 'success', msg: "Title and Short Description saved!" });
          $scope.master.title = response.title;
          $scope.master.short_description = response.short_description;
        }

        return response;
      });
    };

    $scope.description_alerts = [];
    $scope.close_description_alert = function(index) { $scope.description_alerts.splice(index, 1); };

    $scope.save_description = function() {
      var data = { description: $scope.changes.description };
      $api.fundraiser_update($routeParams.id, data).then(function(response) {
        // TODO proper error callback through the $q server `promise.reject(response)`
        if (response.error) {
          $scope.description_alerts.push({ type: 'error', msg: response.error });
        } else {
          $scope.description_alerts.push({ type: 'success', msg: "Description saved!" });
          $scope.master.description = response.description;
          $scope.master.description_html = response.description_html;
        }

        return response;
      });
    };
  });
