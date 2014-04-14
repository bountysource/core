'use strict';

angular.module('activity').controller('ActivityTransactionNavPillsController', function($scope, $q, $api, NavTab) {

  var currentPersonHasMoneyDeferred = $q.defer();
  var currenPersonHasOrdersDeferred = $q.defer();

  $scope.$watch('current_person', function(person) {
    currentPersonHasMoneyDeferred.resolve(person && person.account && person.account.balance > 0);
  });

  $api.transaction_activity().then(function(transactions) {
    currenPersonHasOrdersDeferred.resolve(angular.isArray(transactions) && transactions.length > 0);
  });

  $scope.navElements = [
    new NavTab('Overview',          '/activity/account'),
    new NavTab('Orders',            '/activity/transactions', currenPersonHasOrdersDeferred.promise),
    new NavTab('Cash Outs',         '/activity/cash_outs'),
    new NavTab('Request Cash Out',  '/activity/cash_outs/new', currentPersonHasMoneyDeferred.promise)
  ];

});