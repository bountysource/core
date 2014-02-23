'use strict';

angular.module('fundraiser')
  .config(function($routeProvider, defaultRouteOptions, personResolver) {
    var routeOptions = angular.copy(defaultRouteOptions);

    $routeProvider.when('/fundraiser', angular.extend({
      templateUrl: 'app/fundraiser/index.html'
    }, routeOptions));

    $routeProvider.when('/fundraiser/completed', angular.extend({
      templateUrl: 'app/fundraiser/index.html'
    }, routeOptions));

    $routeProvider.when('/fundraiser/new', angular.extend({
      templateUrl: 'app/fundraiser/create.html',
      resolve: { person: personResolver }
    }, routeOptions));

    $routeProvider.when('/fundraisers/:id', angular.extend({
      templateUrl: 'app/fundraiser/show.html',
      controller: 'FundraiserController'
    }, routeOptions));

    $routeProvider.when('/fundraiser/:id/updates/:update_id/edit', angular.extend({
      templateUrl: 'app/fundraiser_updates/edit.html',
      controller: 'FundraiserController'
    }, routeOptions));

    $routeProvider.when('/fundraiser/:id/updates/:update_id', angular.extend({
      templateUrl: 'app/fundraiser_updates/show.html',
      controller: 'FundraiserController'
    }, routeOptions));

    $routeProvider.when('/fundraiser/:id/edit', angular.extend({
      templateUrl: 'app/fundraiser/edit.html',
      controller: 'FundraiserController',
      resolve: { person: personResolver }
    }, routeOptions));

    $routeProvider.when('/fundraiser/:id/backers', angular.extend({
      templateUrl: 'app/fundraiser/pledges.html',
      controller: 'FundraiserController'
    }, routeOptions));

    $routeProvider.when('/fundraiser/:id/rewards', angular.extend({
      templateUrl: 'app/fundraiser/rewards.html',
      controller: 'FundraiserController'
    }, routeOptions));

    $routeProvider.when('/fundraiser/:id', angular.extend({
      templateUrl: 'app/fundraiser/show.html',
      controller: 'FundraiserController'
    }, routeOptions));

    $routeProvider.when('/fundraiser/:id/updates', angular.extend({
      templateUrl: 'app/fundraiser/updates.html',
      controller: 'FundraiserController'
    }, routeOptions));
  })

  .controller('FundraiserController', function($scope, $routeParams, $filter, $location, $api) {
    $scope.fundraiserPromise = $api.fundraiser_get($routeParams.id).then(function(fundraiser) {
      $scope.can_manage = fundraiser.person && $scope.current_person && fundraiser.person.id === $scope.current_person.id;
      $scope.publishable = fundraiser.title && fundraiser.short_description && fundraiser.funding_goal && fundraiser.description;

      $scope.twitterShareUrlParams = {
        text: ("Support " + (fundraiser.title) + " on @Bountysource!"),
        url: $filter('encodeUriQuery')(fundraiser.frontend_url)
      };
      $scope.twitterShareURL = "https://platform.twitter.com/widgets/tweet_button.html?" + $api.toKeyValue($scope.twitterShareUrlParams);

      console.log(fundraiser);

      $scope.fundraiser = fundraiser;
      return fundraiser;
    });

    // Go to the Pledge page for the fundraiser with the given amount
    $scope.pledgeRedirect = function(fundraiser, amount) {
      console.log('pledgeRedirect', fundraiser, amount);

      $scope.fundraiserPromise.then(function(fundraiser) {
        amount = amount || $scope.pledge.amount;
        if (angular.isNumber(amount) && fundraiser.published) {
          $location.path("/fundraiser/"+$routeParams.id+"/pledge").search({ amount: amount });
        }
      });
    };
  });
