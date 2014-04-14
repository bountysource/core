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
      resolve: { person: personResolver },
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
      if (fundraiser.team && fundraiser.published) {
        teamRedirect(fundraiser.team);
      }

      $scope.fundraiser = angular.copy(fundraiser);

      // Not sure if these are used anywhere else besides fundraiserManageButtons, leave for now.
      $scope.can_manage = $scope.fundraiser.person && $scope.current_person && $scope.fundraiser.person.id === $scope.current_person.id;
      $scope.publishable = $scope.fundraiser.title && fundraiser.short_description && $scope.fundraiser.funding_goal && fundraiser.description;

      return $scope.fundraiser;
    });

    function teamRedirect (team) {
      var path = $location.path();
      var slug = team.slug;

      switch(true) {
      case (/\/fundraisers\/[a-z-_0-9]+$/).test(path):
        $location.path("/teams/"+slug+"/fundraiser").replace();
        break;

      case (/\/fundraisers\/[a-z-_0-9]+\/updates$/).test(path):
        $location.path("/teams/"+slug+"/updates").replace();
        break;

      case (/\/fundraisers\/[a-z-_0-9]+\/updates\/([0-9]+)$/).test(path):
        var match = path.match(/\/fundraisers\/[a-z-_0-9]+\/updates\/([0-9]+)$/);
        $location.path("/teams/"+slug+"/updates/"+match[1]).replace();
        break;

      case (/\/fundraisers\/[a-z-_0-9]+\/backers$/).test(path):
        $location.path("/teams/"+slug+"/backers").replace();
        break;

      case (/\/fundraisers\/[a-z-_0-9]+\/pledge$/).test(path):
        $location.url("/teams/"+slug+"/fundraiser?page=pledge").replace();
        break;
      }
    }

    // Display an update in a modal
    $scope.showUpdateModal = function(update) {

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
