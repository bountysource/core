'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/companies/:id/settings', {
        templateUrl: 'pages/companies/settings.html',
        controller: 'BaseCompanyController',
        resolve: $person
      });
  })
  .controller('EditCompanyController', function ($scope, $routeParams, $location, $api) {
    $scope.company.then(function(company) {

      $scope.form_data = {
        name: company.name,
        slug: company.slug,
        image_url: company.image_url,
        url: company.url
      };

      $scope.save_company = function() {
        $api.company_update(company.slug, $scope.form_data).then(function(updated_company) {
          if (updated_company.error) {
            $scope.error = updated_company.error;
          } else {
            $location.url("/companies/"+updated_company.slug);
          }
        });
      };

    });

  });