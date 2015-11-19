angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/orders/:id', {
    templateUrl: 'admin/orders/show.html',
    controller: "OrderRedirectController"
  });
})
.controller("OrderRedirectController", function ($scope, $api, $routeParams, $location) {
  $api.callv1("/transactions/"+$routeParams.id).then(function(response) {
    $location.url("/admin/transactions/"+response.id);
  });
});
