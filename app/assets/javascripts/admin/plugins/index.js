'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
    .when('/admin/plugins', {
      templateUrl: 'admin/plugins/index.html',
      controller: "Plugins"
    });
  })
  .controller("Plugins", function ($scope, $window, $api) {
    // only for pagination
    $scope.request_params = { per_page: 100 };

    $scope.plugins = $api.call("/admin/tracker_plugins", $scope.request_params, function(response) {
      if (response.meta && response.meta.pagination) {
        $scope.init_pagination(response.meta.pagination);
      }
      response.data.map(function(plugin) { if (plugin.locked_at) { plugin.locked = true; } });
      return response.data;
    });

    $scope.init_pagination = function(options) {
      $scope.$pagination = {
        current_page: options.page,
        num_pages: options.pages,
        items_per_page: options.per_page,

        set_page: function(page) {
          $scope.request_params.page = page;
          $scope.plugins = $api.call(options.request_path || "/admin/tracker_plugins", $scope.request_params, function(response) {
            if (response.meta && response.meta.pagination) {
              $scope.init_pagination(response.meta.pagination);
            }
            response.data.map(function(plugin) { if (plugin.locked_at) { plugin.locked = true; } });
            return response.data;
          });
        }
      };
    };

    $scope.update_plugin = function(plugin) {
      var payload = {
        modify_title: plugin.modify_title,
        modify_body: plugin.modify_body,
        add_label: plugin.add_label,
        label_name: plugin.label_name,
        label_color: plugin.label_color,
        locked: plugin.locked
      };
      $api.update_tracker_plugin(plugin.id, payload).then(function() {
        $scope.$pagination.set_page($scope.$pagination.current_page);
      });
    };
  });
