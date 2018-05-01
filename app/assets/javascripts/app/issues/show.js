angular.module('app').controller('IssueShowController', function ($scope, $api, $routeParams, $window, $location, $pageTitle, $anchorScroll, $cart, $analytics, $currency, Timeline, BountyClaim, Web3Utils, Issue, $modal) {
  var issue_id = parseInt($routeParams.id);

  // load core issue object
  $scope.issue = Issue.get({
    id: issue_id,
    include_body_html: true,
    include_author: true,
    include_tracker: true,
    include_team: true,
    include_counts: true
  }, function(issue) {
    $scope.team = issue.team;
    $pageTitle.set($scope.issue.title, $scope.issue.tracker.name);
  }, function(error){
    $scope.issue_deleted = true;
    $scope.issue_error = error.data.error;
  });

  // get list of 100 events for issue home page
  $scope.events = Timeline.query({
    per_page: 100,
    issue_id: issue_id
  });

  // create bounty box (allow prefil via &amount=123 in query params)
  $scope.post_custom_bounty = {
    amount: parseInt($routeParams.amount, 10) || null
  };
  $scope.add_bounty_to_cart = function(amount) {
    // Track event
    $analytics.bountyStart({ type: (amount ? 'buttons' : 'custom'), amount: amount });

    return $cart.addBounty({
      amount: amount || $scope.post_custom_bounty.amount,
      currency: amount ? 'USD' : $currency.value,
      issue_id: issue_id
    }).then(function () {
      $location.url("/cart");
    });
  };

  $scope.isMiscCrypto = function(crypto){
    return !['ETH', 'BTC', 'CAN'].includes(crypto);
  }

  $scope.setCrypto = function(crypto){
    $scope.bounty.amount = 0;
    $scope.bounty.token = crypto;
  }

  $scope.isSelectedCrypto = function(crypto){
    return $scope.bounty.token === crypto; 
  }

  $scope.setAmount = function(amount){
    $scope.bounty.amount = amount;
  }

  $scope.oneAtATime = true;
  $scope.bioShow = false;
  $scope.issueBodyShow = false;

  $scope.status = {
    usdOpen: false,
    cryptoOpen: false
  };

  $scope.log = function(message){
    console.log(message)
  }

  $scope.cryptoOptions = ['AE', 'BNB', 'BNT', 'CIND'];
  $scope.bounty = {
    token: 'ETH',
    amount: '0'
  };

  $scope.active_tab = function(name) {
    if (name === 'overview' && (/^\/issues\/[a-z-_0-9]+$/i).test($location.path())) { return "active"; }
    if (name === 'backers' && (/^\/issues\/[a-z-_0-9]+\/backers/).test($location.path())) { return "active"; }
  };


  $scope.openQRModal = function(){
    $modal.open({
      templateUrl: 'common/templates/issueAddressQrModal.html',
      backdrop: true,
      controller: function($scope, $modalInstance, bounty, issue, Web3Utils) {
        $scope.bounty = bounty;
        $scope.issue = issue;
        $scope.closeModal = function() {
          $modalInstance.close();
        };
      },
      resolve: {
        bounty: function () {
          return $scope.bounty;
        },
        issue: function () {
          return $scope.issue;
        }
      }

    });
  }

  $scope.openMetamaskModal = function(){
    $modal.open({
      templateUrl: 'common/templates/metamaskModal.html',
      backdrop: true,
      controller: function($scope, $modalInstance, bounty, issue, openQRModal, Web3Utils) {
        $scope.bounty = bounty;
        $scope.issue = issue;
        $scope.closeModal = function() {
          $modalInstance.close();
          openQRModal()
        };

        $scope.sendThroughMetaMask = function(){
          Web3Utils.sendTransaction($scope.bounty.amount, $scope.issue.issue_address.public_address)
          $scope.closeModal()
        }

        $scope.showQRAddress = function(){
          $scope.closeModal()
          $parent.openQRModal()
        }
      },
      resolve: {
        bounty: function () {
          return $scope.bounty;
        },
        issue: function () {
          return $scope.issue;
        },
        openQRModal: function(){
          return $scope.openQRModal;
        }
      }

    });
  }

  
});
