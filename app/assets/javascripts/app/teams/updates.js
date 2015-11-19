angular.module('fundraisers').controller('TeamUpdatesController', function ($scope, $routeParams, $location, $api) {

  $api.v2.teamUpdates({
    team_slug: $routeParams.id,
    include_body: true
  }).then(function(response) {
    $scope.updates = angular.copy(response.data);
    return $scope.updates;
  });

});
