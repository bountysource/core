'use strict';

angular.module('app.controllers').controller('FundraiserUpdateController', function ($scope, $routeParams, $location, $api) {
  $api.fundraiser_update_get($routeParams.id, $routeParams.update_id).then(function(fundraiser) {
    $scope.update = fundraiser.update;
    return fundraiser;
  });

  $scope.publish = function() {
    $api.fundraiser_update_publish($routeParams.id, $routeParams.update_id, function(response) {
      if (response.meta.success) {
        // update the... update
        $scope.update = angular.copy(response.data.update);

        $location.url("/fundraisers/"+$routeParams.id+"/updates/"+$routeParams.update_id);
      } else {
        $scope.error = response.data.error;
      }
      return response.data;
    });
  };

  $scope.destroy = function() {
    $api.fundraiser_update_destroy($routeParams.id, $routeParams.update_id, function(response) {
      if (response.meta.success) {
        $location.url("/fundraisers/"+$routeParams.id+"/updates");
      } else {
        $scope.error = response.data.error;
      }
    });
  };
});
