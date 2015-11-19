'use strict';

angular.module('fundraisers').controller('FundraiserLeaderboardController', function ($scope, $routeParams, $api) {
  $api.call("/user/fundraisers/"+$routeParams.id+"/top_backers", { per_page: 3 }, function(response) {
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
