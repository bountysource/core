angular.module('app').config(function ($routeProvider, defaultRouteOptions, personResolver) {
  $routeProvider.when('/orders/:id', angular.extend({
    templateUrl: 'app/orders/show.html',
    controller: 'TransactionShowController',
    resolve: { person: personResolver },
    trackEvent: 'View Transaction'
  }, defaultRouteOptions));
}).controller('TransactionShowController', function ($scope, $routeParams, $api, $filter, $window, $twttr) {
  $scope.is_receipt = parseInt($routeParams.receipt, 10) === 1;

  $scope.transaction_promise = $api.call("/transactions/"+$routeParams.id).then(function(transaction) {
    // Collect all Fundraisers and Trackers from the array of items on the transaction
    $scope.trackers = [];
    $scope.fundraisers = [];
    for (var i=0; i<transaction.items.length; i++) {
      if (transaction.items[i].issue) {
        $scope.trackers.push(transaction.items[i].issue.tracker);
      } else if (transaction.items[i].fundraiser) {
        $scope.fundraisers.push(transaction.items[i].fundraiser);
      }
      // coerce bounty_expiration into integer because it returns nil, "never" ,'3', '6'
      transaction.items[i].bounty_expiration = parseExpiration(transaction.items[i].bounty_expiration);
    }

    $scope.transaction = transaction;
    return transaction;
  });

  function parseExpiration (expiration_value) {
    var result;
    if(angular.isUndefined(expiration_value) ||expiration_value === null) {
      result = 0;
    } else if (expiration_value === 'never') {
      result = 0;
    } else {
      result = parseInt(expiration_value, 10);
    }

    return result;
  }

  // This type check also occurs in cart/cart.js
  // Todo: Make resource-factories for each one. They can all inherit
  // from a 'Purchaseable' class that has a method to encapsulate this logic.
  $scope.isPledge = function (item) {
    return angular.isObject(item) && item.type === 'Pledge';
  };

  $scope.isBounty = function (item) {
    return angular.isObject(item) && item.type === 'Bounty';
  };

  $scope.isTeamPayin = function (item) {
    return angular.isObject(item) && item.type === 'TeamPayin';
  };

  $scope.isProposal = function (item) {
    return angular.isObject(item) && item.type === 'Proposal';
  };

  $scope.isSupportLevelPayment = function (item) {
    return angular.isObject(item) && item.type === 'SupportLevelPayment';
  };

  $scope.isIssueSuggestionReward = function(item) {
    return angular.isObject(item) && item.type === 'IssueSuggestionReward';
  };

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
