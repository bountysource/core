'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/companies/new', {
        templateUrl: 'pages/companies/new.html',
        controller: 'NewCompaniesController'
      });
  })
  .controller('NewCompaniesController', function ($scope, $location, $api) {
    $scope.form_data = {};

    $scope.create_company = function () {
      $api.company_create($scope.form_data).then(function(company) {
        if (company.error) {
          $scope.error = company.error;
        } else {
          $location.url("/companies/"+company.id+"/slug");
        }
      });
    };
  });
