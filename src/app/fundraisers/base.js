'use strict';

angular.module('app').controller('FundraiserController', function($scope, $routeParams, $filter, $location, $api) {
  $scope.fundraiser_get_promise = $api.fundraiser_get($routeParams.id).then(function(fundraiser) {
    $scope.can_manage = fundraiser.person && $scope.current_person && fundraiser.person.id === $scope.current_person.id;
    $scope.publishable = fundraiser.title && fundraiser.short_description && fundraiser.funding_goal && fundraiser.description;

    $scope.twitterShareUrlParams = {
      text: ("Support " + (fundraiser.title) + " on @Bountysource!"),
      url: $filter('encodeUriQuery')(fundraiser.frontend_url)
    };
    $scope.twitterShareURL = "https://platform.twitter.com/widgets/tweet_button.html?" + $api.toKeyValue($scope.twitterShareUrlParams);

    $scope.fundraiser = fundraiser;
    return fundraiser;
  });

  // Go to the Pledge page for the fundraiser with the given amount
  $scope.pledgeRedirect = function(fundraiser, amount) {
    console.log('pledgeRedirect', fundraiser, amount);

    $scope.fundraiser_get_promise.then(function(fundraiser) {
      amount = amount || $scope.pledge.amount;
      if (angular.isNumber(amount) && fundraiser.published) {
        $location.path("/fundraisers/"+$routeParams.id+"/pledge").search({ amount: amount });
      }
    });
  };
});
