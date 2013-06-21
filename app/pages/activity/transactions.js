'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/activity/transactions', {
        templateUrl: 'pages/activity/transactions.html',
        controller: 'TransactionActivity'
      });
  })
  .controller('TransactionActivity', function($scope, $routeParams, $api) {
  });

