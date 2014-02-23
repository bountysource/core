'use strict';

angular.module('app').controller('FundraiserLeaderboardUpdateController', function ($scope, $routeParams, $api) {
  $api.call("/user/fundraiser/"+$routeParams.id+"/pledges", { per_page: "3" }).then(function(pledges) {
    for (var i in pledges) { pledges[i].amount = parseFloat(pledges[i].amount); }
    $scope.pledges = pledges;
    return pledges;
  });
});
