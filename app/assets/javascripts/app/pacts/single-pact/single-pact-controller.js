angular
  .module('app')
  .controller('SinglePactController', function ($api, $scope, $location, $anchorScroll, $routeParams, $window, BountyClaim) {
    var id = $location.$$url.split('/').reverse()[0]

    function fetchPact() {
      return $api.v2.getPact(id, { can_respond_to_claims: true })
        .then(function (response) {
          if (response.status !== 200) {
            throw new Error("Failed to fetch pact")
          }

          $scope.pact = response.data
        })
    }

    function fetchPactApplications() {
      return $api.v2.getPactApplications({ pact_id: id })
        .then(function (response) {
          if (response.status !== 200) {
            throw new Error("Failed to fetch pact applications")
          }

          $scope.pact_applications = response.data.pact_applications
        })
    }

    function fetchClaims() {
      return BountyClaim.query({
        pact_id: id,
        include_owner: true,
        include_responses: true
      }).$promise.then(function (claims) {
        $scope.all_bounty_claims = claims
        $scope.claim = claims.find(function (c) {
          c.pact_id == id && c.owner.id === $scope.current_person.id
        })
      });
    }

    function setupPage() {
      Promise.all([
        fetchPact(),
        fetchPactApplications(),
        fetchClaims(),
      ])
        .then(setupDevSection)
        .catch(console.error)
    }

    setupPage()

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
        .then(function () { $api.v2.getPact(id) })
        .then(function (response) { $scope.pact = response.data })
    }

    function setupDevSection(pact) {
      $scope.developer_form = {
        data: {},
      }

      var status = "no_solution";

      if ($scope.current_person) {
        if($scope.pact_applications.some(function (a) { a.person.id === $scope.current_person.id })) {
          // current user has already applied
          status = 'applied';
        }

        if($scope.pact.completed_at) {
          status = "completed";
        }

        if($scope.claim) {
          status = "claimed"

          $scope.developer_form.data.url = $scope.claim.url
          $scope.developer_form.data.description = $scope.claim.description
        }
      }

      $scope.developer_form.data.status = status

      $scope.developer_form.show_applying = function () {
        $scope.developer_form.data.status = "applying"
      }

      $scope.developer_form.apply = function () {
        $api.v2.createPactApplication({
          note: $scope.developer_form.data.note,
          pact_id: $scope.pact.id
        })
      }

      $scope.developer_form.show_claiming = function () {
        $scope.developer_form.data.status = "claiming"
      }

      $scope.developer_form.claim = function () {
        var data = {
          code_url: $scope.developer_form.data.url,
          description: $scope.developer_form.data.description
        }

        function handle_response(r) {
          if (r && r.error) {
            console.error(r.error)
            $scope.developer_form.error = r.error
          } else {
            return fetchClaims().then(setupDevSection)
          }
        }

        if (!$scope.claim) {
          $api.pact_bounty_claim_create($scope.pact.id, data).then(handle_response)
        } else {
          $api.bounty_claim_update($scope.claim.id, data).then(handle_response)
        }
      }

      if ($scope.all_bounty_claims) {
        angular.forEach($scope.all_bounty_claims, function (claim) {
          angular.forEach(claim.responses, function (res) {
            if ($scope.current_person.id === res.owner.id) {
              claim.my_response = res
            }
          })
        })
      }

      var backer_form = $scope.backer_form = {
        accept_claim: function(bounty_claim) {
          $api.bounty_claim_accept(bounty_claim.id, bounty_claim.my_form_data.description).then(backer_form.bounty_claim_response_callback);
        },

        reject_claim: function(bounty_claim) {
          $api.bounty_claim_reject(bounty_claim.id, bounty_claim.my_form_data.description).then(backer_form.bounty_claim_response_callback);
        },

        resolve_claim: function(bounty_claim) {
          $api.bounty_claim_resolve(bounty_claim.id, bounty_claim.my_form_data.description).then(backer_form.bounty_claim_response_callback);
        },

        reset_claim: function(bounty_claim) {
          $api.bounty_claim_reset(bounty_claim.id, bounty_claim.my_form_data.description).then(backer_form.bounty_claim_response_callback);
        },

        start_response: function(bounty_claim, action) {
          bounty_claim.my_form_data = { action: action };
          if (bounty_claim.my_response) {
            bounty_claim.my_form_data.description = bounty_claim.my_response.description;
          }
        },

        cancel_response: function(bounty_claim) {
          bounty_claim.my_form_data = null;
        },

        bounty_claim_response_callback: function() {
          Promise.all([
            fetchPact(),
            fetchClaims()
          ]).then(setupDevSection)
        }
      };

      $scope.$apply()
    }
  })
