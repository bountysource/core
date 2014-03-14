'use strict';

angular.module('fundraisers').controller('FundraiserUpdatesController', function ($scope, $routeParams, $location, $api) {
  $scope.fundraiserPromise.then(function(fundraiser) {
    $api.v2.fundraiserUpdates({
      fundraiser_id: fundraiser.id,
      include_body_html: true
    }).then(function(response) {
      $scope.updates = angular.copy(response.data);
      return $scope.updates;
    });
  });

  $scope.create_update = function() {
    $api.fundraiser_update_create($routeParams.id, {}, function(response) {
      if (response.meta.success) {
        var fundraiser = response.data;
        var update = response.data.update;
        $location.url("/fundraisers/"+fundraiser.slug+"/updates/"+update.id+"/edit");
      } else {
        $scope.error = response.data.error;
      }
    });
  };
});
