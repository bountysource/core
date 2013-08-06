'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/companies', {
        templateUrl: 'pages/companies/index.html',
        controller: 'CompaniesIndexController',
        title: 'Companies'
      });
  })
  .controller('CompaniesIndexController', function ($scope, $location, $api) {
    $scope.companies = $api.list_companies();
  });
