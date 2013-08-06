'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/companies/new', {
        templateUrl: 'pages/companies/new.html',
        controller: 'NewCompaniesController',
        resolve: $person,
        title: 'Bountysource - Create New Company'
      });
  })
  .controller('NewCompaniesController', function ($scope, $location, $api) {
    $scope.form_data = {};

    $scope.create_company = function () {
      $api.company_create($scope.form_data).then(function(company) {
        if (company.error) {
          $scope.error = company.error;
        } else {
          $location.url("/companies/"+company.slug);
        }
      });
    };

    $scope.slugify = function(text) {
      return (text||"").toLowerCase().replace(/[ ]+/g,'-').replace(/[,.]/g,'').replace(/-(inc|llc)$/,'');
    };

    $scope.$watch('form_data.name', function() {
      $scope.form_data.slug = $scope.slugify($scope.form_data.name);
    });
  });
