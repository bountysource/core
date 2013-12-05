'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/tools/installed', {
        templateUrl: 'pages/tools/installed.html',
        controller: 'BaseToolsController',
        reloadOnSearch: false,
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
  controller("InstalledPluginsController", function($scope, $api) {
    // Nested callbacks to filter out trackers that don't have a plugin
    $scope.plugins_promise.then(function(plugins) {
      var all_trackers_map = {}, tracker_name;
      for (var i=0; i<plugins.length; i++) {
        tracker_name = plugins[i].tracker.full_name.split('/')[0];
        all_trackers_map[tracker_name] = all_trackers_map[tracker_name] || [];
        all_trackers_map[tracker_name].push(plugins[i].tracker);
      }

      $scope.all_trackers = [];
      for (var k in all_trackers_map) {
        $scope.all_trackers.push([k, all_trackers_map[k]]);
      }

      // order by owner name FIRST, then by number of projects
      $scope.all_trackers.sort(function(a, b) {
        if ($scope.current_person && $scope.current_person.github_account && a[0] === $scope.current_person.github_account.login) {
          return -1;
        } else if ($scope.current_person && $scope.current_person.github_account && b[0] === $scope.current_person.github_account.login) {
          return 1;
        } else {
          return a[1].length === b[1].length ? 0 : (a[1].length < b[1].length ? 1 : -1);
        }
      });

      return plugins;
    });

    $scope.hide_installed_button = true;
  });
