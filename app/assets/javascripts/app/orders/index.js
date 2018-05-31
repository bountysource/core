angular.module('app').config(function ($routeProvider, defaultRouteOptions, personResolver) {
  $routeProvider.when('/orders', angular.extend({
    templateUrl: 'app/orders/index.html',
    controller: 'TransactionsController',
    resolve: { person: personResolver }
  }, defaultRouteOptions));
}).controller('TransactionsController', function($scope, $routeParams, $api) {
  $api.transaction_activity().then(function(transactions) {
    $scope.transactions = transactions;
    return transactions;
  });
});
