angular.module('app').controller('IssueShowController', function ($scope, $api, $routeParams, $window, $location, $pageTitle, $anchorScroll, $analytics, Timeline, BountyClaim, Web3Utils, Issue, $modal) {
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
  $scope.usdCart = {
    amount: 0,
    item_type: 'bounty',
    issue_id: issue_id,
    bounty_expiration: null,
    currency: 'USD'
  }

  $scope.checkout = {}

  $scope.setOwner = function (type, owner) {
    switch (type) {
      case ('anonymous'):
        $scope.owner = {
          display_name: 'Anonymous',
          image_url: '<%= asset_path("anon.jpg") %>'
        };
        $scope.usdCart.owner_id = null;
        $scope.usdCart.owner_type = null;
        $scope.usdCart.anonymous = true;
        break;

      case ('person'):
        $scope.owner = angular.copy(owner);
        $scope.usdCart.owner_id = owner.id;
        $scope.usdCart.owner_type = 'Person';
        $scope.usdCart.anonymous = false;
        break;

      case ('team'):
        $scope.owner = angular.copy(owner);
        $scope.usdCart.owner_id = owner.id;
        $scope.usdCart.owner_type = 'Team';
        $scope.usdCart.anonymous = false;       
        break;

      default:
        $log.error('Unexpected owner:', type, owner);
    }
  };

  $scope.checkoutUsd = function() {
    $scope.$watch('current_person', function (person) {
      if (angular.isObject(person)) {
        $api.v2.checkout({item: $scope.usdCart, checkout_method: $scope.checkout.checkout_method}).then(function(response) {
          $window.location = response.data.checkout_url;
        });
      } else if (person === false) {
        $api.set_post_auth_url($location.path());
        $location.url('/signin');
      }
    });
  }

  $scope.setUsdAmount = function(amount){
    $scope.usdCart.amount = amount;
  }

  $scope.calculateCartTotal = function () {
    if ($scope.usdCart.tweet) {
      $scope.usdCart.total = $scope.usdCart.amount + 20
    } else {
      $scope.usdCart.total = $scope.usdCart.amount
    }
    return $scope.usdCart.total;
  };

  $scope.bountyExpirationOptions = [
    { value: null, description: 'Never' },
    { value: 3, description: '3 Months ($100 minimum)' },
    { value: 6, description: '6 Months ($250 minimum)' }
  ];

  $scope.bountyUponExpirationOptions = [
    { value: 'refund', description: 'Refund to my Bountysource account' },
    { value: 'donate to project', description: 'Donate to project' }
  ];

  $scope.bountyExpirationValid = function () {
    switch ($scope.usdCart.bounty_expiration) {
      case (3):
        return $scope.usdCart.amount >= 100;

      case (6):
        return $scope.usdCart.amount >= 250;

      default:
        return true;
    }
  };

  $scope.updateUponExpiration = function() {
    if ($scope.usdCart.bounty_expiration === null) { $scope.usdCart.upon_expiration = null; }
  }

  $scope.canCheckout = function () {
    return $scope.usdCart.amount >= 5 && $scope.checkout.checkout_method && $scope.bountyExpirationValid()
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

  $api.v2.currencies().then(function(currencies){
    $scope.currencies = currencies.data;
    $scope.cryptoOptions = Object.keys(currencies.data);
  })
  
  $scope.bounty = {
    token: 'ETH',
    amount: '0'
  };

  $api.crypto_bounties_get($routeParams.id).then(function(cryptoBounties){
    $scope.cryptoBounties = cryptoBounties
  })

  $scope.active_tab = function(name) {
    if (name === 'overview' && (/^\/issues\/[a-z-_0-9]+$/i).test($location.path())) { return "active"; }
    if (name === 'backers' && (/^\/issues\/[a-z-_0-9]+\/backers/).test($location.path())) { return "active"; }
  };

  $scope.generate_address = function(issue_id){
    if(($scope.issue.issue_address || {} ).public_address === undefined){
      $api.issue_address_create(issue_id).then(function(issue){
        $scope.issue = issue
        if(Web3Utils.isMetaMask() && $scope.isSelectedCrypto('ETH')) {
          $scope.openMetamaskModal()
        } else {
          $scope.openQRModal()
        }
      })
    } else {
      if(Web3Utils.isMetaMask() && $scope.isSelectedCrypto('ETH')) {
        $scope.openMetamaskModal()
      } else {
        $scope.openQRModal()
      }
    }
  }

  $scope.openHunterBox = function() {
    $modal.open({
      templateUrl: 'common/templates/hunterBoxModal.html',
      backdrop: true,
      size: 'sm',
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

  $scope.openQRModal = function(){
    $modal.open({
      templateUrl: 'common/templates/issueAddressQrModal.html',
      backdrop: true,
      controller: function($scope, $interval, $modalInstance, bounty, issue, cryptoBounties, Web3Utils) {
        $scope.timeLoaded = Date.now()
        $scope.bounty = bounty;
        $scope.issue = issue;
        $scope.cryptoBounties = cryptoBounties;

        $scope.closeModal = function() {
          $modalInstance.close();
        };

        $scope.bountyPoller;
        $scope.startPolling = function(){
          
          $scope.bountyPoller = $interval(function(){
            $api.crypto_bounties_get($routeParams.id).then(function(cryptoBounties){
              $scope.cryptoBounties = cryptoBounties
            })  
          }, 3000)
        }

        $scope.stopPolling = function() {
          if (angular.isDefined(bountyPoller)) {
            $interval.cancel(bountyPoller);
            bountyPoller = undefined;
          }
        };

        $scope.startPolling()

        $scope.$on('$destroy', function() {
          // Make sure that the interval is destroyed too
          $scope.stopPolling();
        });

        $scope.newBounties = function() {
          return $scope.cryptoBounties.filter(getNewBounties)
        }
        
        // helper functions
        $scope.getNewBounties =  function(bounty) {
          return (new Date(bounty.created_at)) > $scope.timeLoaded;
        }
      },
      resolve: {
        bounty: function () {
          return $scope.bounty;
        },
        issue: function () {
          return $scope.issue;
        },
        cryptoBounties: function(){
          return $scope.cryptoBounties;
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

  // Fetch teams for person to load Team account checkout method radios
  $scope.$watch('current_person', function(person) {
    if (angular.isObject(person)) {
      $scope.setOwner('person', person);
      $api.person_teams(person.id).then(function(teams) {
        $scope.teams = angular.copy(teams);
      });
    }
  });

  
});
