angular.module('fundraisers').controller('TeamUpdateController', function ($scope, $routeParams, $location, $api, $pageTitle) {

  $api.v2.teamUpdate($routeParams.update_id, {
    team_slug: $routeParams.id,
    include_body: true
  }).then(function(response) {
    $scope.update = angular.copy(response.data);
    $pageTitle.set($scope.update.title);
    return $scope.updates;
  });
});
