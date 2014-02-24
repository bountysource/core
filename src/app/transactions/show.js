'use strict';

angular.module('app').controller('TransactionShowController', function ($scope, $routeParams, $api, $filter, $window) {
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
    }

    // TODO Make this share functionality a module that can take any object + url
    ///////// Share button logic /////////
    var item = transaction.items[0];

    //if item has fundraisers key, its a pledge
    if ('fundraiser' in item) {
      setShareUrls(item, item.fundraiser, "fundraiser");
    //if item has issue key, its a bounty
    } else if ('issue' in item) {
      setShareUrls(item, item.issue, "issue");
    }

    $scope.transaction = transaction;
    return transaction;
  });

  function setShareUrls (item, parent, item_type) {

    //set the tweet text based upon the item type
    var tweet_text;
    if (item_type === "fundraiser") {
      tweet_text = "I just pledged "+$filter('dollars')(item.amount)+" to "+parent.title+"!";
    } else {
      tweet_text = "I just posted a "+$filter('dollars')(item.amount)+" bounty on Bountysource!";
    }
    $scope.tweet_text = encodeURIComponent(tweet_text);

    var tweet_url = "https://www.bountysource.com"+parent.frontend_path;
    $scope.tweet_url = encodeURIComponent(tweet_url);

    var google_url = "https://www.bountysource.com"+parent.frontend_path;
    $scope.google_url = "https://plus.google.com/share?url="+ encodeURIComponent(google_url);

    var facebook_url = "https://www.bountysource.com"+parent.frontend_path;
    $scope.facebook_url = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(facebook_url);
  }

  // allows share windows to open
  $scope.openFacebook = function (url) {
    var left = screen.width/2 - 300;
    var top = screen.height/2 - 300;
    $window.open(url, "Facebook", 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600,top='+top+', left='+left);
    return false;
  };

  $scope.openGooglePlus = function (url) {
    var left = screen.width/2 - 300;
    var top = screen.height/2 - 300;
    $window.open(url, "Google+", 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600,top='+top+', left='+left);
    return false;
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
