'use strict';

angular.module('fundraisers').controller('TeamUpdatesController', function ($scope, $routeParams, $location, $api) {

  $scope.$watch('activeFundraiser', function(fundraiser) {
    if (fundraiser) {
      $api.v2.fundraiserUpdates({
        fundraiser_id: fundraiser.id,
        include_body_html: true
      }).then(function(response) {
        $scope.updates = angular.copy(response.data);
        return $scope.updates;
      });
    }
  });

});
