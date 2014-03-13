'use strict';

angular.module('fundraisers')
  .config(function($routeProvider, defaultRouteOptions, personResolver) {
    var routeOptions = angular.copy(defaultRouteOptions);

    $routeProvider.when('/fundraisers', angular.extend({
      templateUrl: 'app/fundraisers/index.html',
      controller: 'FundraiserIndexController',
      trackEvent: 'View Fundraisers'
    }, routeOptions));

    $routeProvider.when('/fundraisers/completed', angular.extend({
      templateUrl: 'app/fundraisers/index.html',
      controller: 'FundraiserIndexController',
      trackEvent: 'View Fundraisers Completed'
    }, routeOptions));

    $routeProvider.when('/fundraisers/new', angular.extend({
      templateUrl: 'app/fundraisers/new.html',
      controller: 'FundraiserCreateController',
      trackEvent: 'View Fundraiser Create'
    }, routeOptions));

    $routeProvider.when('/fundraisers/:id', angular.extend({
      templateUrl: 'app/fundraisers/show.html',
      controller: 'FundraiserController',
      trackEvent: 'View Fundraiser'
    }, routeOptions));

    $routeProvider.when('/fundraisers/:id/edit', angular.extend({
      templateUrl: 'app/fundraisers/edit.html',
      controller: 'FundraiserController',
      resolve: { person: personResolver },
      trackEvent: 'View Fundraiser Edit'
    }, routeOptions));

    $routeProvider.when('/fundraisers/:id/backers', angular.extend({
      templateUrl: 'app/fundraisers/pledges.html',
      controller: 'FundraiserController',
      trackEvent: 'View Fundraiser Pledges'
    }, routeOptions));

    $routeProvider.when('/fundraisers/:id/rewards', angular.extend({
      templateUrl: 'app/fundraisers/rewards.html',
      controller: 'FundraiserController',
      trackEvent: 'View Fundraiser Rewards'
    }, routeOptions));

    $routeProvider.when('/fundraisers/:id/updates', angular.extend({
      templateUrl: 'app/fundraisers/updates.html',
      controller: 'FundraiserController',
      trackEvent: 'View Fundraiser Updates'
    }, routeOptions));

    $routeProvider.when('/fundraisers/:id/updates/:update_id', angular.extend({
      templateUrl: 'app/fundraisers/update.html',
      controller: 'FundraiserController',
      trackEvent: 'View Fundraiser Update'
    }, routeOptions));

    $routeProvider.when('/fundraisers/:id/pledge', angular.extend({
      templateUrl: 'app/fundraisers/pledge.html',
      controller: 'FundraiserController',
      trackEvent: 'View Fundraiser Pledge'
    }, routeOptions));
  })

  .controller('FundraiserController', function($scope, $routeParams, $filter, $location, $api, $modal) {
    $scope.fundraiserPromise = $api.fundraiser_get($routeParams.id).then(function(fundraiser) {
      $scope.fundraiser = angular.copy(fundraiser);

      $scope.can_manage = $scope.fundraiser.person && $scope.current_person && $scope.fundraiser.person.id === $scope.current_person.id;
      $scope.publishable = $scope.fundraiser.title && fundraiser.short_description && $scope.fundraiser.funding_goal && fundraiser.description;

      return $scope.fundraiser;
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

    // Display an update in a modal
    $scope.showUpdateModal = function(update) {
      console.log('showUpdateModal', update);

      $modal.open({
        templateUrl: 'app/fundraisers/templates/showUpdateModal.html',
        controller: function($scope, $api, $modalInstance) {

          // Need to make request for individual update to get the body
          $api.v2.fundraiserUpdate(update.id).then(function(response) {
            $scope.update = angular.copy(response.data);
          });

          $scope.close = function() {
            $modalInstance.dismiss();
          };

        }
      });
    };
  });
