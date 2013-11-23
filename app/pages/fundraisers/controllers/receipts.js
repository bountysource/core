'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/fundraisers/:id/receipts', {
        templateUrl: 'pages/fundraisers/receipts.html',
        controller: 'FundraiserReceiptsController',
        resolve: $person
      })
      .when('/fundraisers/:id/receipts/recent', {
        templateUrl: 'pages/fundraisers/receipts.html',
        controller: 'FundraiserReceiptsController',
        resolve: $person
      });
  })

  .controller('FundraiserReceiptsController', function ($scope, $twttr, $routeParams, $api, $location, $filter, $window) {
    $scope.receipts = [];
    $scope.type = 'index';
    $scope.fundraiser = $api.fundraiser_get($routeParams.id);
    if ((/^\/fundraisers\/[A-Za-z-_0-9]+\/receipts\/recent[\/]?$/i).test($location.path())) {
      $scope.type = 'recent';
    }

    $scope.fundraiser.then(function (fundraiser) {
      $api.pledge_activity().then(function (response) {
        //grab all of the users pledges, if any of them have the same ID as this fundraiser, then push to the receipts array
        for (var e = 0; e < response.length; e++) {
          if (response[e].fundraiser.id === fundraiser.id) {
            $scope.receipts.push(response[e]);
          }
        }

        if ($scope.type === 'index') { //show all of users pledges for a fundraiser
          if ($scope.receipts.length === 1) {
            $scope.pledge = $scope.receipts[0];
            $scope.fundraiser = $scope.receipts[0].fundraiser;
          }

          if ($location.search().pledge_id || $scope.pledge) { //if a pledge_id is specified load that particular receipt page
            if (!$scope.pledge) {
              for (var i = 0; i < $scope.receipts.length; i++) {
                if ($scope.receipts[i].id === parseInt($location.search().pledge_id, 10)) {
                  $scope.pledge = $scope.receipts[i];
                  $scope.fundraiser = $scope.receipts[i].fundraiser;
                }
              }
            }
          }
        } else {
          $scope.pledge = $scope.receipts[0];
          $scope.fundraiser = $scope.receipts[0].fundraiser;
        }

        $scope.highlighted_fundraisers = $api.fundraisers_get().then(function(fundraisers) {
          var highlighted_fundraisers = [];
          for (var i = 0; i < fundraisers.length; i++) {
            if (fundraisers[i].in_progress && fundraisers[i].featured && fundraisers[i].id !== fundraiser.id) {
              highlighted_fundraisers.push(fundraisers[i]);
            }
          }
          return highlighted_fundraisers;
        });

        var tweet_text = "I just pledged "+$filter('dollars')($scope.pledge.amount)+" to "+$scope.fundraiser.title+"!";
        $scope.tweet_text = encodeURIComponent(tweet_text);

        var tweet_url = "https://www.bountysource.com/fundraisers/"+$scope.fundraiser.id;
        $scope.tweet_url = encodeURIComponent(tweet_url);

        var google_url = "https://www.bountysource.com/fundraisers/"+$scope.fundraiser.id;
        $scope.google_url = "https://plus.google.com/share?url="+ encodeURIComponent(google_url);

        var facebook_url = "https://www.bountysource.com/fundraisers/"+$scope.fundraiser.id;
        $scope.facebook_url = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(facebook_url);

      });
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

    $api.fundraisers_get().then(function(fundraisers) {
      var highlighted_fundraisers = [];
      for (var i = 0; i < fundraisers.length; i++) {
        if (fundraisers[i].in_progress && fundraisers[i].featured) {
          highlighted_fundraisers.push(fundraisers[i]);
        }
      }
      $scope.highlighted_fundraisers = highlighted_fundraisers;
    });

    $scope.share_fundraiser_link = $location.absUrl().replace(/\/receipts.*$/, '');

  });
