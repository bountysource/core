'use strict';

angular.module('app')
  .config(function ($routeProvider, personResolver) {
    $routeProvider
      .when('/tools', {
        templateUrl: 'pages/tools/all.html',
        controller: 'BaseToolsController',
        reloadOnSearch: false,
        resolve: {
          person: personResolver,
          permissions: function($rootScope) {
            $rootScope.$watch('current_person', function(person) {
              $rootScope.__can_use_plugin__ = person && person.github_account && person.github_account.permissions.indexOf("public_repo") >= 0;
            });
          }
        }
      });
  });
