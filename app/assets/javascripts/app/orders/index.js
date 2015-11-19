'use strict';

angular.module('app').config(function ($routeProvider, defaultRouteOptions, personResolver) {
  $routeProvider.when('/orders', angular.extend({
    templateUrl: 'app/orders/index.html',
    controller: 'TransactionsController',
    resolve: { person: personResolver },
    trackEvent: 'View My Transactions'
  }, defaultRouteOptions));
}).controller('TransactionsController', function($scope, $routeParams, $api) {
  $api.transaction_activity().then(function(transactions) {
    $scope.transactions = transactions;
    return transactions;
  });
});
