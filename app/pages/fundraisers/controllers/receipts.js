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
            $scope.haveHighlightedFundraisers($scope.fundraiser);
          }
        } else {
          $scope.pledge = $scope.receipts[0];
          $scope.fundraiser = $scope.receipts[0].fundraiser;
          $scope.haveHighlightedFundraisers($scope.fundraiser);
        }

        var tweet_text = "I just pledged "+$filter('dollars')($scope.pledge.amount)+" to "+$scope.fundraiser.title+"!";
        $scope.tweet_text = encodeURIComponent(tweet_text);

        var fundraiser_url = $location.absUrl().replace(/\/receipts.*$/, '');
        $scope.tweet_url = encodeURIComponent(fundraiser_url);
        $scope.google_url = "https://plus.google.com/share?url="+ encodeURIComponent(fundraiser_url);
        $scope.facebook_url = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(fundraiser_url);

      });
    });

    $scope.haveHighlightedFundraisers = function(current) { //will populate $scope.highlighted_fundraisers, and trigger an ng-show on view
      if (!current) {
        throw "needs current object";
      }
      $api.fundraisers_get().then(function(fundraisers) {
        var highlighted_fundraisers = [];
        for (var i = 0; i < fundraisers.length; i++) {
          if (fundraisers[i].in_progress && fundraisers[i].featured && fundraisers[i].id !== current.id) {
            highlighted_fundraisers.push(fundraisers[i]);
          }
        }
        if (highlighted_fundraisers.length > 0) {
          $scope.highlighted_fundraisers = highlighted_fundraisers;
        }
      });
    };

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

    $scope.share_fundraiser_link = $location.absUrl().replace(/\/receipts.*$/, '');

  });
