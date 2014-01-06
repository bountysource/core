'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/transactions/:id', {
        templateUrl: 'pages/transactions/show.html',
        controller: 'TransactionShowController',
        resolve: $person
      });
  })
  .controller('TransactionShowController', function ($scope, $routeParams, $api) {
    $scope.is_receipt = parseInt($routeParams.receipt, 10) === 1;

    $scope.transaction_promise = $api.call("/transactions/"+$routeParams.id).then(function(transaction) {
      console.log(transaction);

      // Collect all Fundraisers and Trackers from the array of items on the transaction
      $scope.trackers = [];
      $scope.fundraisers = [];
      for (var i=0; i<transaction.items.length; i++) {
        if (transaction.items[i].issue) {
          $scope.trackers.push(transaction.items[i].issue.tracker);
        } else if (transaction.items[i].fundraiser) {
          $scope.fundraisers.push(transaction.items[i].fundraiser);
        }
      }

      $scope.transaction = transaction;
      return transaction;
    });

    // Watch for trackers collected form Transaction items.
    // Generate list of related issues.
    $scope.$watch('trackers', function(trackers) {
      if (angular.isDefined(trackers) && trackers.length > 0) {
        // HACK: just use the first issues tracker, since cart is single-item-purchase for now.
        // TODO combine trackers
      }
    });

    // Watch for trackers collected form Transaction items.
    // Generate list of related issues.
    $scope.$watch('fundraisers', function(fundraisers) {
      if (angular.isDefined(fundraisers) && fundraisers.length > 0) {
        // TODO recommended fundraisers?
      }
    });

  });

