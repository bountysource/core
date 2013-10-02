'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/fundraisers/:id/receipts', {
        templateUrl: 'pages/fundraisers/receipts.html',
        controller: 'FundraiserReceiptsController',
        resolve: $person
      });
  })

  .controller('FundraiserReceiptsController', function ($scope, $twttr, $routeParams, $api, $location, $filter, $window) {
    $scope.receipts = [];
    $scope.fundraiser = $api.fundraiser_get($routeParams.id);

    $scope.fundraiser.then(function (fundraiser) {
      $api.pledge_activity().then(function (response) {
        for (var e = 0; e < response.length; e++) {  //grab all of the users pledges, if any of them have the same ID as this fundraiser, then push to the receipts array
          if (response[e].fundraiser.id === fundraiser.id) {
            $scope.receipts.push(response[e]);
          }
        }

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
