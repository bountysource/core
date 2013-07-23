'use strict';

angular.module('app')
  .controller('BaseCompanyController', function($scope, $location, $routeParams, $api) {
    $scope.company = $api.company_get($routeParams.id);
    $scope.set_company = function(company) {
      $scope.company = company;
    }

    $scope.company.then(function(company) {
      $scope.tabs = [
        { name: 'Projects', url: '/companies/' + company.slug }
      ];

      $scope.is_active = function(url) {
        return url === $location.path();
      };

      $scope.$watch('current_person', function(person) {
        if (person) {
          for (var i=0; i < company.members.length; i++) {
            if ((company.members[i].id === person.id) && company.members[i].is_admin) {
              $scope.is_admin = true;
              $scope.tabs.push({ name: 'Settings', url: '/companies/' + company.slug + '/settings' });
            }
          }
        }
      });
    });

  });
