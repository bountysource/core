'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/:id', {
        templateUrl: 'pages/issues/show.html',
        controller: 'IssueShow'
      });
  })

  .controller('IssueShow', function ($scope, $routeParams, $window, $location, $payment, $api, $pageTitle, $metaTags, $filter) {
    $scope.bounty = {
      amount: parseInt($routeParams.amount, 10),
      anonymous: $routeParams.anonymous || false,
      payment_method: $routeParams.payment_method || 'google'
    };

    // alert above the issue title about bounty status
    $scope.bounty_alert = {
      type: 'warning',
      show: true,
      state: "available"
    };

    $scope.issue = $api.issue_get($routeParams.id).then(function(issue) {

      $pageTitle.set(issue.title, issue.tracker.name);
      console.log(issue);
      $metaTags.add({
        'twitter:card':                'product',
        'twitter:site':                '@bountysource',
        'twitter:creator':             '',
        'twitter:title':               issue.title,
        'twitter:description':         issue.short_body,
        'twitter:image:src':           issue.tracker.large_image_url,
        'twitter:data1':               $filter('dollars')(issue.bounty_total),
        'twitter:label1':              'Bounties',
        'twitter:data2':               issue.bounties.length,
        'twitter:label2':              $filter('pluralize')('Backer', issue.bounties.length),
        'twitter:domain':              'bountysource.com',
        'twitter:app:name:iphone':     '',
        'twitter:app:name:ipad':       '',
        'twitter:app:name:googleplay': '',
        'twitter:app:url:iphone':      '',
        'twitter:app:url:ipad':        '',
        'twitter:app:url:googleplay':  '',
        'twitter:app:id:iphone':       '',
        'twitter:app:id:ipad':         '',
        'twitter:app:id:googleplay':   ''
      });
      // append item number now that we have issue
      $scope.bounty.item_number = "issues/"+issue.id;

      $scope.create_payment = function() {
        var base_url = $window.location.href.replace(/\/issues.*$/,'');
        var payment_params = angular.copy($scope.bounty);

        payment_params.success_url = base_url + "/activity/bounties";
        payment_params.cancel_url = $window.location.href;

        $payment.process(payment_params, {
          error: function(response) {
            console.log("Payment Error:", response);
          },

          noauth: function() {
            $api.set_post_auth_url("/issues/" + issue.slug, payment_params);
            $location.url("/signin");
          }
        });
      };

      // set bounty info message data
      if (issue.bounty_claims.length === 0) {
        $scope.bounty_alert.state = "available";
        $scope.bounty_alert.type = "info";
      } else if (issue.winning_bounty_claim) {
        $scope.bounty_alert.state = "accepted";
        $scope.bounty_alert.type = "success";
      } else if (issue.bounty_claims.length === 1) {
        if (issue.bounty_claims[0].rejected) {
          $scope.bounty_alert.state = "rejected";
          $scope.bounty_alert.type = "error";
        } else if (issue.bounty_claims[0].disputed) {
          $scope.bounty_alert.state = "disputed";
          $scope.bounty_alert.type = "warning";
        } else {
          // good! go vote on that shit
          $scope.bounty_alert.state = "submitted";
          $scope.bounty_alert.type = "info";
        }
      } else {
        $scope.bounty_alert.state = "contested";
        $scope.bounty_alert.type = "error";
      }

      return issue;
    });
  });

