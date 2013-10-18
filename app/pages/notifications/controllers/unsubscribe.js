'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/notifications/unsubscribe', {
        templateUrl: 'pages/notifications/unsubscribe.html',
        controller: 'NotificationsController',
        title: 'Unsubscribe from Bountysource Emails'
      });
  }).controller('NotificationsController', function($routeParams, $scope, $api) {
    var email_address = $routeParams.email;
    var email_list = $routeParams.type;
    var data = {
      email: email_address,
      type: email_list
    };
    $scope.response = $api.notification_unsubscribe(data);
  });