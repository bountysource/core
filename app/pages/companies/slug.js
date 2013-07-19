'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/companies/:id/slug', {
        templateUrl: 'pages/companies/slug.html',
        controller: 'CompanySlugController'
      });
  })
  .controller('CompanySlugController', function ($scope, $routeParams, $location, $api) {
    $scope.company = $api.company_get($routeParams.id).then(function(company) {
      console.log(company);
      return company;
    });

    $scope.slug = null;
    $scope.set_slug = function() {
      $api.company_set_slug($routeParams.id, $scope.slug).then(function() {
        console.log('Yay!');
        $location.url("/companies/"+$routeParams.id+"/edit");
      });
    };
  });



