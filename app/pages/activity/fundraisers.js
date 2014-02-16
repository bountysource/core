'use strict';

angular.module('app.controllers').controller('FundraiserActivity', ['$scope', '$routeParams', '$api', '$pageTitle', function($scope, $routeParams, $api, $pageTitle) {
  $pageTitle.set('Fundraisers', 'Activity');

  $api.fundraiser_activity().then(function(fundraisers) {
    $scope.fundraisers = fundraisers;
    return fundraisers;
  });
}]);
