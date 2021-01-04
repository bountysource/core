angular
  .module('app')
  .controller('SinglePactController', function ($api, $scope, $location, $anchorScroll, $routeParams, $window) {
    let id = $location.$$url.split('/')[2]

    $api.v2.getPact(id).then(function (response) {
      if (response.status === 200) {
        $scope.pact = response.data
      }
    })

    // create bounty box (allow prefil via &amount=123 in query params)
    $scope.usdCart = {
      amount: 5,
      item_type: 'bounty',
      pact_id: id,
      bounty_expiration: null,
      currency: 'USD'
    };

    $scope.checkout = {};

    $scope.setOwner = function (type, owner) {
      switch (type) {
        case ('anonymous'):
          $scope.owner = {
            display_name: 'Anonymous',
            image_url: '<%= asset_path("bs-anon.png") %>'
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
    };

    $scope.calculateCartTotal = function () {
      if ($scope.usdCart.tweet) {
        $scope.usdCart.total = $scope.usdCart.amount + 20;
      } else {
        $scope.usdCart.total = $scope.usdCart.amount;
      }
      return $scope.usdCart.total;
    };

    $scope.bountyExpirationOptions = [
      { value: null, description: 'Never' },
      { value: 3, description: '3 Months ($100 minimum)' },
      { value: 6, description: '6 Months ($250 minimum)' }
    ];

    $scope.setUsdAmount = function(amount){
      $scope.usdCart.amount = amount;
    };

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
    };

    $scope.canCheckout = function () {
      return $scope.usdCart.amount >= 5 && $scope.checkout.checkout_method && $scope.bountyExpirationValid();
    };

    $scope.canPostBounty = function () {
      return $scope.cryptoBountyTotal() > 5;
    };

    $scope.setAmount = function(amount){
      $scope.bounty.amount = amount;
    };

    // developer section
    $scope.developer_form.data = {}
    if ($scope.pact.can_add_bounty) {
      if ($scope.
    }
  })
