'use strict';

angular.module('app').controller('FundraiserEditUpdateController', function ($scope, $routeParams, $location, $api) {
  $scope.changes = {};

  $api.fundraiser_update_get($routeParams.id, $routeParams.update_id).then(function(fundraiser) {
    $scope.update = fundraiser.update;
    $scope.changes = $scope.update;
    return fundraiser;
  });

  $scope.save = function() {
    $api.fundraiser_update_edit($routeParams.id, $routeParams.update_id, $scope.changes, function(response) {
      if (response.meta.success) {
        $scope.back();
      } else {
        $scope.error = response.data.error;
      }
    });
  };

  $scope.back = function() {
    $location.url("/fundraisers/"+$routeParams.id+"/updates/"+$routeParams.update_id);
  };
});
