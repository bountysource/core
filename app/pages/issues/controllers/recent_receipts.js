'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/issues/:id/receipts/recent', {
        templateUrl: 'pages/issues/recent_receipts.html',
        controller: 'IssueRecentReceiptsController',
        resolve: $person
      });
  })

  .controller('IssueRecentReceiptsController', function ($scope, $twttr, $routeParams, $api, $location, $filter, $window) {
    $scope.issue = $api.issue_get($routeParams.id);
    $api.bounty_activity().then(function (response) {
      console.log(response);
      $scope.bounty = response[0];
      $scope.issue = response[0].issue;

      var tweet_text = "I just placed a "+$filter('currency')($scope.bounty.amount)+" bounty on Bountysource!";
      $scope.tweet_text = encodeURIComponent(tweet_text);
      var tweet_url = "https://www.bountysource.com/issues/"+$scope.issue.id;
      $scope.tweet_url = encodeURIComponent(tweet_url);
      var google_url = "https://www.bountysource.com/issues/"+$scope.issue.id;
      $scope.google_url = "https://plus.google.com/share?url="+ encodeURIComponent(google_url);
      var facebook_url = "https://www.bountysource.com/issues/"+$scope.issue.id;
      $scope.facebook_url = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(facebook_url);
    });

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

    $scope.calculateFee = function (bounty) {
      var fee = bounty.amount * 0.10;
      return $filter('currency')(fee);
    };

    $scope.calculateTotal = function (bounty) {
      var total = bounty.amount * 1.10;
      return $filter("currency")(total);
    };

  });
