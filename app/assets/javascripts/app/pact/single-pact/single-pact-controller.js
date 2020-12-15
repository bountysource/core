angular
  .module('app')
  .controller('SinglePactController', function ($api, $scope, $location, $anchorScroll, $routeParams) {
    let id = $location.$$url.split('/')[2]
    $api.v2.get_pact(id, { id }).then(function (response) {
      if (response.status === 200) {
        $scope.pact = response.data[0]
      }
    })
  })
