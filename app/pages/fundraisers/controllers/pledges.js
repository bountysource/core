'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id/backers', {
        templateUrl: 'pages/fundraisers/pledges.html',
        controller: 'FundraiserShowController'
      });
  })

  .controller('FundraiserPledgesController', function ($scope, $routeParams, $api) {
    $api.call("/user/fundraisers/"+$routeParams.id+"/pledges", { per_page: 100 }, function(response) {
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
