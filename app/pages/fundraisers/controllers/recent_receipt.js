'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/fundraisers/:id/receipts/recent', {
        templateUrl: 'pages/fundraisers/receipts.html',
        controller: 'FundraiserRecentReceiptsController',
        resolve: $person
      });
  })

  .controller('FundraiserRecentReceiptsController', function ($scope, $twttr, $routeParams, $api, $location, $filter, $window) {
    $scope.fundraiser = $api.fundraiser_get($routeParams.id);
    $api.pledge_activity().then(function (response) {
      console.log(response);
      $scope.pledge = response[0];
      $scope.fundraiser = response[0].fundraiser;

      var tweet_text = "I just pledged "+$filter('currency')($scope.pledge.amount)+" to "+$scope.fundraiser.title+"!";
      $scope.tweet_text = encodeURIComponent(tweet_text);
      var tweet_url = "https://www.bountysource.com/fundraisers/"+$scope.fundraiser.id;
      $scope.tweet_url = encodeURIComponent(tweet_url);
      var google_url = "https://www.bountysource.com/fundraisers/"+$scope.fundraiser.id;
      $scope.google_url = "https://plus.google.com/share?url="+ encodeURIComponent(google_url);
      var facebook_url = "https://www.bountysource.com/fundraisers/"+$scope.fundraiser.id;
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

  });
