'use strict';

angular.module('app')
  .controller('FundraiserLeaderboardController', function ($scope, $routeParams, $api) {
    $scope.pledges = $api.call("/user/fundraisers/"+$routeParams.id+"/pledges", { per_page: "3" }, function(response) {
      if (response.meta.success) {
        var pledges = response.data;
        for (var i in pledges) { pledges[i].amount = parseFloat(pledges[i].amount); }
        return pledges;
      }
    });
  });
