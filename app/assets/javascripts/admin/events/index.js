angular.module('app').config(function ($routeProvider) {
  $routeProvider.when('/admin/events', {
    templateUrl: 'admin/events/index.html',
    controller: function ($scope, $api) {

      var params = {};
      $api.call('/admin/events', {}, function(response) {
        $scope.events = response.data;
      });

    }
  });
});
