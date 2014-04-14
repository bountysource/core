'use strict';

angular.module('activity').controller('FundraisersController', function($scope, $routeParams, $api, $pageTitle) {
  $pageTitle.set('Fundraisers', 'Activity');

  $api.fundraiser_activity().then(function(fundraisers) {
    $scope.fundraisers = fundraisers;
    return fundraisers;
  });
});
