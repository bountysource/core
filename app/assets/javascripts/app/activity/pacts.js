angular.module('activity').controller('PactsController', function($scope, $routeParams, $api, $pageTitle) {
  $pageTitle.set('Pacts', 'Activity');

  $api.call("/user/pacts").then(function(pacts) {
    $scope.pacts = pacts;
    console.log(pacts)
    return pacts;
  });
});
