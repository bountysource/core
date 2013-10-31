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
      $api.bounty_activity().then(function (response) {
        for (var e = 0; e < response.length; e++) {  //grab all of the users pledges, if any of them have the same ID as this issue, then push to the receipts array
          if (response[e].issue.id === issue.id) {
            $scope.receipts.push(response[e]);
          }
        }
        if ($scope.type === 'index') {
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
                  $scope.haveRelatedIssues();
                }
              }
            }
          }
        } else if ($scope.type === 'recent') { //api bounty activity call for recent receipt view
          $scope.bounty = $scope.receipts[0];
          $scope.issue = $scope.receipts[0].issue;
          $scope.haveRelatedIssues();
        }
        var tweet_text = "I just placed a "+$filter('dollars')($scope.bounty.amount)+" bounty on Bountysource!";
        $scope.tweet_text = encodeURIComponent(tweet_text);
        var tweet_url = "https://www.bountysource.com/issues/"+$scope.issue.id;
        $scope.tweet_url = encodeURIComponent(tweet_url);
        var google_url = "https://www.bountysource.com/issues/"+$scope.issue.id;
        $scope.google_url = "https://plus.google.com/share?url="+ encodeURIComponent(google_url);
        var facebook_url = "https://www.bountysource.com/issues/"+$scope.issue.id;
        $scope.facebook_url = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(facebook_url);
      });
    });

    $scope.haveRelatedIssues = function() { //will populate $scope.related_issues, and trigger an ng-show on view
      $api.tracker_issues_get($scope.issue.tracker.id).then(function(issues) {
        var related_issues = [];
        for (var i=0; i<issues.length; i++) {
          issues[i].bounty_total = parseFloat(issues[i].bounty_total);

          // sorting doesn't like nulls.. this is a quick hack
          issues[i].participants_count = issues[i].participants_count || 0;
          issues[i].thumbs_up_count = issues[i].thumbs_up_count || 0;
          issues[i].comment_count = issues[i].comment_count || 0;

          if (issues[i].id === $scope.issue.id || !issues[i].can_add_bounty || issues[i].paid_out) {
            // dont add to list if current issue, or if bounties cannot be added, or if issue has been paid out
          } else {
            related_issues.push(issues[i]);
          }
        }
        $scope.related_issues = related_issues;
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

    $scope.calculateFee = function (bounty) {
      if ($scope.fee) {
        return $filter('currency')($scope.fee);
      } else if (bounty) {
        var fee = bounty.amount * 0.10;
        return $filter('currency')(fee);
      }
    };

    $scope.calculateTotal = function (bounty) {
      if ($scope.total) {
        return $filter('currency')($scope.total);
      } else if (bounty) {
        var total = bounty.amount * 1.10;
        return $filter("currency")(total);
      }
    };

    $scope.share_issue_link = $location.absUrl().replace(/\/receipts.*$/, '');

  });
