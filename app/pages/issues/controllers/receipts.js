'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/issues/:id/receipts', {
        templateUrl: 'pages/issues/receipts.html',
        controller: 'IssueReceiptsController',
        resolve: $person
      })
      .when('/issues/:id/receipts/recent', {
        templateUrl: 'pages/issues/receipts.html',
        controller: 'IssueReceiptsController',
        resolve: $person
      });
  })

  .controller('IssueReceiptsController', function ($scope, $twttr, $routeParams, $api, $location, $filter, $window) {
    $scope.type = 'index';
    if ((/^\/issues\/[A-Za-z-_0-9]+\/receipts\/recent[\/]?$/i).test($location.path())) {
      $scope.type = 'recent';
    }
    $scope.receipts = [];
    $scope.issue = $api.issue_get($routeParams.id);

    $scope.issue.then(function (issue) {
      if ($scope.type === 'index') {
        $api.bounty_activity().then(function (response) {
          for (var e = 0; e < response.length; e++) {  //grab all of the users pledges, if any of them have the same ID as this issue, then push to the receipts array
            if (response[e].issue.id === issue.id) {
              $scope.receipts.push(response[e]);
            }
          }

          if ($scope.receipts.length === 1) {
            $scope.bounty = $scope.receipts[0];
            $scope.fee = parseInt($scope.receipts[0].amount, 10)*0.10;
            $scope.total = parseInt($scope.bounty.amount, 10) + parseInt($scope.bounty.amount, 10)*0.10;
          }

          if ($location.search().bounty_id || $scope.bounty) { //if a bounty_id is specified load that particular receipt page
            if (!$scope.bounty) {
              for (var i = 0; i < $scope.receipts.length; i++) {
                if ($scope.receipts[i].id === parseInt($location.search().bounty_id, 10)) {
                  $scope.bounty = $scope.receipts[i];
                  $scope.issue = $scope.receipts[i].issue;
                  $scope.fee = parseInt($scope.bounty.amount, 10)*0.10;
                  $scope.total = parseInt($scope.bounty.amount, 10) + parseInt($scope.bounty.amount, 10)*0.10;
                }
              }
            }
          }
        });
      } else if ($scope.type === 'recent') { //API bounty activity call for recent receipt view
        $api.bounty_activity().then(function (response) {
          $scope.bounty = response[0];
          $scope.issue = response[0].issue;
        });
      }

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
      if ($scope.fee) {
        return $filter('currency')($scope.fee);
      }
      var fee = bounty.amount * 0.10;
      return $filter('currency')(fee);
    };

    $scope.calculateTotal = function (bounty) {
      if ($scope.total) {
        return $filter('currency')($scope.total);
      }
      var total = bounty.amount * 1.10;
      return $filter("currency")(total);
    };

  });
