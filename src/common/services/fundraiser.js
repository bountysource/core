'use strict';

angular.module('services').service('$fundraiser', function($api, $window, $scope, $location, $routeParams) {
  // Store a self reference
  this.self = this;

  // Publish a Fundraiser draft.
  this.publish = function(fundraiser) {
    $api.fundraiser_publish(fundraiser.id, function(response) {
      if (response.meta.success) {
        // TODO I do not know why this doesn't work: $location.url("/fundraisers/"+fundraisers.slug).replace();
        $window.location = "/fundraisers/"+fundraiser.slug;
      } else {
        $scope.error = "ERROR: " + response.data.error;
      }

      return response.data;
    });
  };

  // Go to the Pledge page for the fundraiser and prefill the amount with the given value.
  this.pledgeRedirect = function(fundraiser, amount) {
    console.log('pledgeRedirect', fundraiser, amount);

    $scope.fundraiserPromise.then(function(fundraiser) {
      amount = amount || $scope.pledge.amount;
      if (angular.isNumber(amount) && fundraiser.published) {
        $location.path("/fundraisers/"+$routeParams.id+"/pledge").search({ amount: amount });
      }
    });
  };
});
