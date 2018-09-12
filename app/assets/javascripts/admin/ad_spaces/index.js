angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/ad_spaces', {
        templateUrl: 'admin/ad_spaces/index.html',
        controller: "AdSpaces"
      });
  })
  .controller("AdSpaces", function ($scope, $api) {

    $api.get_ad_spaces().then(function(response) {
      $scope.adverts = angular.copy(response.data);
    });

    $scope.delete = function(item) {
      if(confirm("Are you sure?")){
        $api.delete_ad_space(item.id).then(function(response){
          var index = $scope.adverts.indexOf(item);
          $scope.adverts.splice(index, 1);
        });
      }
    };
  });
