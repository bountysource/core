'use strict';

angular.module('app')
  .controller('BaseToolsController', function ($scope, $routeParams, $window, $location, $api) {
    $scope.active_tab = function(tab) {
      if (tab === 'all' && /^\/tools$/i.test($location.path())) { return 'active'; }
      else if (tab === 'installed' && /^\/tools\/installed$/i.test($location.path())) { return 'active'; }
    };

    $scope.github_auth = function(redirect_url) {
      $api.set_post_auth_url(redirect_url || $location.path());
      $window.location = $api.signin_url_for('github', { scope: ["public_repo"] });
    };

    $scope.loading_trackers = true;
    $scope.plugin_loading = false;

    $scope.new_plugin = {
      modify_title: false,
      modify_body: false,
      add_label: false,
      label_name: "bounty",
      label_color: "#129e5e"
    };

    $scope.current_tracker = null;
    $scope.current_plugin = null;
    $scope.current_tracker_has_plugin = false;

    $scope.expand_tracker = function(tracker) {
      $scope.current_tracker = tracker;
      $scope.current_plugin = $scope.get_plugin(tracker);
      $scope.plugin_alert = {};
    };

    $scope.collapse_tracker = function() {
      $scope.current_tracker = null;
      $scope.current_plugin = null;
    };

    $scope.all_trackers = $api.trackers_get().then(function(trackers) {
      $scope.loading_trackers = false;

      var owner_map = {}, owner;
      for (var i=0; i<trackers.length; i++) {
        owner = trackers[i].full_name.split('/')[0];
        owner_map[owner] = owner_map[owner] || [];
        owner_map[owner].push(trackers[i]);
      }

      $scope.open_by_default = Object.keys(owner_map).length === 1;

      return owner_map;
    });

    $scope.plugins = $api.tracker_plugins_get().then(function(plugins) {
      // Get the plugin for a tracker, if installed.
      // if not installed, return model for a new plugin
      $scope.get_plugin = function(tracker) {
        if (tracker) {
          for (var i=0; i<plugins.length; i++) {
            if (plugins[i].tracker.id === tracker.id) {
              var plugin = angular.copy(plugins[i]);
              plugin.$master = angular.copy(plugins[i]);
              $scope.current_tracker_has_plugin = true;
              return plugin;
            }
          }
          $scope.current_tracker_has_plugin = false;
          return $scope.new_plugin;
        }
      };

      $scope.plugin_changed = function(plugin) {
        if (plugin) {
          var copy = angular.copy(plugin);
          delete copy.$master;
          return !angular.equals(plugin.$master, copy);
        }
      };

      // Check to see if the plugin was installed for a tracker.
      // caches the value on tracker model if checking for the first time
      $scope.plugin_installed = function(tracker) {
        if (tracker.$plugin_installed === true || tracker.$plugin_installed === false) {
          return tracker.$plugin_installed;
        } else {
          tracker.$plugin_installed = false;
          for (var i=0; i<plugins.length; i++) {
            if (plugins[i].tracker.id === tracker.id) {
              tracker.$plugin_installed = true;
              break;
            }
          }
          return tracker.$plugin_installed;
        }
      };

      $scope.plugin_alert = { text: '', type: 'warning' };

      $scope.update_plugin = function(plugin) {
        $scope.plugin_loading = "Saving changes...";

        var payload = {
          modify_body: plugin.modify_body,
          modify_title: plugin.modify_title,
          add_label: plugin.add_label,
          label_name: plugin.label_name,
          label_color: plugin.label_color
        };

        $api.tracker_plugin_update(plugin.tracker.id, payload).then(function(updated_plugin) {
          $scope.plugin_loading = false;

          if (updated_plugin.error) {
            $scope.plugin_alert.text = updated_plugin.error;
          } else {
            var copy = angular.copy(plugin);
            delete copy.$master;
            plugin.$master = copy;

            // update the cached version
            for (var i=0; i<plugins.length; i++) {
              if (plugins[i].id === plugin.id) {
                for (var k in plugin.$master) { plugins[i][k] = plugin.$master[k]; }
                break;
              }
            }
          }
        });
      };

      $scope.create_plugin = function() {
        if ($scope.current_tracker) {
          $scope.plugin_loading = "Installing plugin...";

          if (!$scope.__can_use_plugin__) {
            // redirect through github to get public repo permission
            $scope.github_auth($location.path() + "?tracker=" + ($scope.current_tracker || {}).full_name);
          } else {
            $api.tracker_plugin_create($scope.current_tracker.id, $scope.new_plugin).then(function(plugin) {
              $scope.plugin_loading = false;

              if (plugin.error) {
                $scope.plugin_alert.text = plugin.error;
              } else {
                $scope.current_tracker.$plugin_installed = true;
                $scope.expand_tracker($scope.current_tracker);
                plugins.push(plugin);
              }
            });
          }
        }
      };

      return plugins;
    });
  });


