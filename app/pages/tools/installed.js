'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/tools/installed', {
        templateUrl: 'pages/tools/installed.html',
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
  }).
  controller("InstalledPluginsController", function($scope) {
    // Nested callbacks to filter out trackers that don't have a plugin
    $scope.plugins.then(function(plugins) {
      $scope.all_trackers_listener = $scope.$watch('all_trackers', function(owner_map) {
        if (owner_map) {
          var trackers, new_owner_map = {};

          for (var k in owner_map) {
            trackers = owner_map[k];

            for (var i=0; i<trackers.length; i++) {
              for (var j=0; j<plugins.length; j++) {
                if (trackers[i].id === plugins[j].tracker.id) {
                  new_owner_map[k] = new_owner_map[k] || [];
                  new_owner_map[k].push(trackers[i]);
                  break;
                }
              }
            }
          }
          $scope.all_trackers = new_owner_map;
          $scope.all_trackers_listener();
        }
      });
      return plugins;
    });
    $scope.hide_installed_button = true;
  });
