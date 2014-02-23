'use strict';

angular.module('fundraiser').controller('FundraiserLeaderboardController', function ($scope, $routeParams, $api) {
  $api.call("/user/fundraiser/"+$routeParams.id+"/top_backers", { per_page: 3 }, function(response) {
    if (response.meta.success) {
      var pledges = response.data;

      for (var i in pledges) {
        pledges[i].amount = parseFloat(pledges[i].amount);
      }

      $scope.pledges = pledges;
      return pledges;
    }
  });
});
