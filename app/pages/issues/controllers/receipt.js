'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/issues/:issue_id/bounties/receipt', {
        templateUrl: 'pages/issues/receipt.html',
        controller: 'BountyReceiptController',
        resolve: $person
      });
  })
.controller('BountyReceiptController', function ($filter, $twttr, $scope, $routeParams, $window, $location, $payment, $api) {

  if ($location.search().bounty_id) { //if a bounty_id is specified load that particular receipt page

    $api.bounty_activity().then(function (response) {
      for (var i = 0; i < response.length; i++) {
        if (response[i].id === $location.search().bounty_id) {
          $scope.bounty = response[i];
          $scope.issue = response[i].issue;
          $scope.total = parseInt($scope.bounty.amount, 10) + parseInt($scope.bounty.amount, 10)*0.10;
        }
      }

      if (!$scope.bounty) {
        $location.path("/issues/"+$routeParams.issue_id+"/bounties"); //redirect if person is attempting to view receipt for bounty they don't own
      } else {
        var tweet_text = "I just placed a "+$filter('currency')($scope.bounty.amount)+" bounty on Bountysource!";
        $scope.tweet_text = encodeURIComponent(tweet_text);
        var tweet_url = "https://www.bountysource.com/issues/"+$scope.issue.id;
        $scope.tweet_url = encodeURIComponent(tweet_url);
        var google_url = "https://www.bountysource.com/issues/"+$scope.issue.id;
        $scope.google_url = "https://plus.google.com/share?url="+ encodeURIComponent(google_url);
        var facebook_url = "https://www.bountysource.com/issues/"+$scope.issue.id;
        $scope.facebook_url = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(facebook_url);
      }

    });
  } else { //call most recent pledge receipt for this user
    $api.bounty_activity().then(function (response) {
      $scope.bounty = response[0];
      $scope.total = parseInt($scope.bounty.amount, 10) + ($scope.bounty.amount*0.10);
      $scope.issue = response[0].issue;
    });
  }

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

  $scope.toggle_anonymous = function(bounty) {
    $api.bounty_anonymity_toggle(bounty).then(function() {
      bounty.anonymous = !bounty.anonymous;
    });
  };

});
