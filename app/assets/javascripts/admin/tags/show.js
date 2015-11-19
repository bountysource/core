angular.module('app').config(function ($routeProvider) {
  $routeProvider.when('/admin/tags/:id', {
    templateUrl: 'admin/tags/show.html',
    controller: function ($scope, $api, $routeParams) {
      $api.get_tag($routeParams.id).then(function(response) {
        $scope.tag = response.data;
      });

      $scope.deleteTag = function() {
        if (prompt("Type DELETE below if you really want to delete this team") === 'DELETE') {
          $api.delete_tag($scope.tag.id).then(function(response) {
            alert("All done!");
          });
        }
      };
    }
  });
});
