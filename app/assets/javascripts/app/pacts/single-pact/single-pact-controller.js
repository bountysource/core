angular
  .module('app')
  .controller('SinglePactController', function ($api, $scope, $location, $anchorScroll, $routeParams, $window) {
    let id = $location.$$url.split('/').reverse()[0]

    Promise.all([
      $api.v2.getPact(id),
      $api.v2.getPactApplications({ pact_id: id })
    ])
      .then(function ([pact_response, applications_response]) {
        if(pact_response.status !== 200 || applications_response.status !== 200) {
          console.log("responses were not successful");
          console.log(pact_response, applications_response)
          return
        }

        $scope.pact = pact_response.data
        $scope.pact_applications = applications_response.data.pact_applications

        setupDevSection()
      })
      .catch(console.error)

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

    $scope.goToSignInPage = function() {
      $location.url('/signin');
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

    $scope.markPactCompleted = function () {
      $api.v2.markPactCompleted(id)
        .then(() => $api.v2.getPact(id))
        .then(response => $scope.pact = response.data)
    }

    function setupDevSection(pact) {
      $scope.developer_form = {
        data: {},
      }

      let status = "no_solution";

      if ($scope.current_person) {
        if($scope.pact_applications.some(a => a.person.id === $scope.current_person.id)) {
          // current user has already applied
          status = 'applied';
        }

        if($scope.pact.completed_at) {
          status = "completed";
        }
      }

      $scope.developer_form.data.status = status

      $scope.developer_form.show_applying = () => {
        $scope.developer_form.data.status = "applying"
      }

      $scope.developer_form.apply = () => {
        $api.v2.createPactApplication({
          note: $scope.developer_form.data.note,
          pact_id: $scope.pact.id
        })
      }

      $scope.developer_form.claim = () => {
      }
    }
  })
