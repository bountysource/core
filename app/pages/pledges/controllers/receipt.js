'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/fundraisers/:fundraiser_id/pledge/receipt', {
        templateUrl: 'pages/pledges/receipt.html',
        controller: 'PledgeReceiptController',
        resolve: $person
      });
  })
.controller('PledgeReceiptController', function ($filter, $twttr, $scope, $routeParams, $window, $location, $payment, $api) {

  if ($location.search().pledge_id) { //if a pledge_id is specified load that particular receipt page

    $api.pledge_activity().then(function (response) {
      for (var i = 0; i < response.length; i++) {
        if (response[i].id === $location.search().pledge_id) {
          $scope.pledge = response[i];
          $scope.fundraiser = response[i].fundraiser;
        }
      }

      if (!$scope.pledge) {
        $location.path("/fundraisers/"+$routeParams.fundraiser_id+"/pledges"); //redirect if person is attempting to view receipt for bounty they don't own
      } else {
        var tweet_text = "I just pledged "+$filter('currency')($scope.pledge.amount)+" to "+$scope.fundraiser.title+"!";
        $scope.tweet_text = encodeURIComponent(tweet_text);
        var tweet_url = "https://www.bountysource.com/fundraisers/"+$scope.fundraiser.id;
        $scope.tweet_url = encodeURIComponent(tweet_url);
        var google_url = "https://www.bountysource.com/fundraisers/"+$scope.fundraiser.id;
        $scope.google_url = "https://plus.google.com/share?url="+ encodeURIComponent(google_url);
        var facebook_url = "https://www.bountysource.com/fundraisers/"+$scope.fundraiser.id;
        $scope.facebook_url = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(facebook_url);
      }
    });

  } else { //call most recent pledge receipt for this user

    $api.pledge_activity().then(function (response) {
      console.log(response);
      $scope.pledge = response[0];
      $scope.fundraiser = response[0].fundraiser;
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

  $scope.toggle_anonymous = function(pledge) {
    $api.pledge_anonymity_toggle(pledge).then(function() {
      pledge.anonymous = !pledge.anonymous;
    });
  };

});
