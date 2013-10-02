'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/tools', {
        templateUrl: 'pages/tools/all.html',
        controller: 'BaseToolsController',
        resolve: angular.extend($person, {
          // hacky way to require that the person has enabled public_repo before loading.
          permissions: function($rootScope) {
            $rootScope.$watch('current_person', function(person) {
              $rootScope.__can_use_plugin__ = person && person.github_account && person.github_account.permissions.indexOf("public_repo") >= 0;
            });
          }
        })
      });
  });
