'use strict';

angular.module('app')
  .config(function ($routeProvider, personResolver) {
    $routeProvider
      .when('/activity/fundraisers', {
        templateUrl: 'pages/activity/fundraisers.html',
        controller: 'FundraiserActivity',
        resolve: {
          person: personResolver
        }
      });
  })
  .controller('FundraiserActivity', function($scope, $routeParams, $api, $pageTitle) {
    $pageTitle.set('Fundraisers', 'Activity');

    $api.fundraiser_activity().then(function(fundraisers) {
      $scope.fundraisers = fundraisers;
      return fundraisers;
    });
  });

