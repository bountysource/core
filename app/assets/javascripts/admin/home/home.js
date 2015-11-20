angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin', {
         redirectTo: "/admin/kpi"
      });
  });

