'use strict';

angular.module('fundraisers').controller('TeamUpdateController', function ($scope, $routeParams, $location, $api) {

  $scope.$watch('activeFundraiser', function(fundraiser) {
    if (fundraiser) {

      $api.v2.fundraiserUpdate($routeParams.update_id, {
        include_body_html: true
      }).then(function(response) {
        $scope.update = angular.copy(response.data);
        return $scope.updates;
      });

    }
  });

});
