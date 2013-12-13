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
  .controller('TransactionShowController', function ($scope, $routeParams, $api, $filter) {
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

//    $scope.related_issues_promise = $api.tracker_issues_get($scope.issue.tracker.id).then(function(issues) {
//      $filter('filter')
//
//      var related_issues = [];
//      for (var i=0; i<issues.length; i++) {
//        issues[i].bounty_total = parseFloat(issues[i].bounty_total);
//
//        // sorting doesn't like nulls.. this is a quick hack
//        issues[i].participants_count = issues[i].participants_count || 0;
//        issues[i].thumbs_up_count = issues[i].thumbs_up_count || 0;
//        issues[i].comment_count = issues[i].comment_count || 0;
//
//        if (issues[i].id === $scope.issue.id || !issues[i].can_add_bounty || issues[i].paid_out) {
//          // dont add to list if current issue, or if bounties cannot be added, or if issue has been paid out
//        } else {
//          related_issues.push(issues[i]);
//        }
//      }
//
//      console.log(related_issues);
//
//      $scope.related_issues = related_issues;
//      return related_issues;
//    });

  });

