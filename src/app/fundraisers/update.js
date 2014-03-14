'use strict';

angular.module('fundraisers').controller('FundraiserUpdateController', function ($scope, $routeParams, $location, $api) {
  $scope.fundraiserPromise.then(function() {

    $api.v2.fundraiserUpdate($routeParams.update_id, {
      include_body_html: true
    }).then(function(response) {
      $scope.update = angular.copy(response.data);
      return $scope.updates;
    });

  });
});
