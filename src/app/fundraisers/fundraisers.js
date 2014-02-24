'use strict';

angular.module('fundraisers')
  .config(function($routeProvider, defaultRouteOptions, personResolver) {
    var routeOptions = angular.copy(defaultRouteOptions);

    $routeProvider.when('/fundraisers', angular.extend({
      templateUrl: 'app/fundraisers/index.html',
      controller: 'FundraiserIndexController'
    }, routeOptions));

    $routeProvider.when('/fundraisers/completed', angular.extend({
      templateUrl: 'app/fundraisers/index.html',
      controller: 'FundraiserIndexController'
    }, routeOptions));

    $routeProvider.when('/fundraisers/new', angular.extend({
      templateUrl: 'app/fundraisers/create.html',
      controller: 'FundraiserCreateController',
      resolve: { person: personResolver }
    }, routeOptions));

    $routeProvider.when('/fundraisers/:id', angular.extend({
      templateUrl: 'app/fundraisers/show.html',
      controller: 'FundraiserController'
    }, routeOptions));

    $routeProvider.when('/fundraisers/:id/updates/:update_id/edit', angular.extend({
      templateUrl: 'app/fundraiser_updates/edit.html',
      controller: 'FundraiserController'
    }, routeOptions));

    $routeProvider.when('/fundraisers/:id/updates/:update_id', angular.extend({
      templateUrl: 'app/fundraiser_updates/show.html',
      controller: 'FundraiserController'
    }, routeOptions));

    $routeProvider.when('/fundraisers/:id/edit', angular.extend({
      templateUrl: 'app/fundraisers/edit.html',
      controller: 'FundraiserController',
      resolve: { person: personResolver }
    }, routeOptions));

    $routeProvider.when('/fundraisers/:id/backers', angular.extend({
      templateUrl: 'app/fundraisers/pledges.html',
      controller: 'FundraiserController'
    }, routeOptions));

    $routeProvider.when('/fundraisers/:id/rewards', angular.extend({
      templateUrl: 'app/fundraisers/rewards.html',
      controller: 'FundraiserController'
    }, routeOptions));

    $routeProvider.when('/fundraisers/:id', angular.extend({
      templateUrl: 'app/fundraisers/show.html',
      controller: 'FundraiserController'
    }, routeOptions));

    $routeProvider.when('/fundraisers/:id/updates', angular.extend({
      templateUrl: 'app/fundraisers/updates.html',
      controller: 'FundraiserController'
    }, routeOptions));

    $routeProvider.when('/fundraisers/:id/pledge', angular.extend({
      templateUrl: 'app/fundraisers/pledge.html',
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

      $scope.fundraiser = fundraiser;
      return fundraiser;
    });

    // Go to the Pledge page for the fundraisers with the given amount
    $scope.pledgeRedirect = function(fundraiser, amount) {
      console.log('pledgeRedirect', fundraiser, amount);

      $scope.fundraiserPromise.then(function(fundraiser) {
        amount = amount || $scope.pledge.amount;
        if (angular.isNumber(amount) && fundraiser.published) {
          $location.path("/fundraisers/"+$routeParams.id+"/pledge").search({ amount: amount });
        }
      });
    };

    // Action for the publish button shown to fundraiser owner on all pages
    $scope.publishFundraiser = function(fundraiser) {
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
  });
