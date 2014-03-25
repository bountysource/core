'use strict';

angular.module('app').controller('BaseToolsController', function ($scope, $routeParams, $window, $location, $api) {
  // Render a re-authorize link in the presence of the glorious authorize parameter.
  if (parseInt($routeParams.reauthorize, 10) === 1) {
    $scope.reAuthorize = true;
  }

  $scope.active_tab = function(tab) {
    if (tab === 'all' && /^\/tools$/i.test($location.path())) { return 'active'; }
    else if (tab === 'installed' && /^\/tools\/installed$/i.test($location.path())) { return 'active'; }
  };
  $scope.github_associated = $scope.current_person && $scope.current_person.github_account;
  if (!$scope.github_associated) {
    $scope.github_associated = false;
  }
  $scope.github_auth = function(redirect_url) {
    $api.set_post_auth_url(redirect_url || $location.path());
    $window.location = $api.signin_url_for('github', { scope: ["public_repo"] });
  };
  $scope.loading_trackers = true;
  $scope.plugin_loading = false;

  $scope.new_plugin = {
    modify_title: true,
    modify_body: true,
    add_label: true,
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
    $scope.$watch('plugin_changed(current_plugin)', function() {
      if (tracker.$plugin_installed && $scope.plugin_changed($scope.current_plugin)) {
        if (!$scope.plugin_alert.initial_message) {
          $scope.plugin_alert = { text: 'There are unsaved changes.', type: 'warning'};
        } else {
          $scope.plugin_alert.initial_message = false;
        }
      }
    });

  };

  $scope.collapse_tracker = function() {
    $scope.current_tracker = null;
    $scope.current_plugin = null;
    $scope.$watch('current_plugin', function() {
      $scope.plugin_alert = {};
    });
  };

  $api.v2.peopleTrackers({
    include_description: true
  }).then(function(response) {
    var trackers = angular.copy(response.data);

    $scope.trackers_count = trackers.length;
    $scope.loading_trackers = false;

    var owner_map = [], owner;
    for (var i=0; i<trackers.length; i++) {
      // This shouldn't be necessary, but sometimes Trackers were being added with no full_name.
      // This has been addressed in the API going forward, but I am leaving this block in just in case
      // this pops up again.
      if (trackers[i].full_name) {
        owner = trackers[i].full_name.split('/')[0];
        owner_map[owner] = owner_map[owner] || [];
        trackers[i].owner = owner;
        owner_map[owner].push(trackers[i]);
      }
    }
    // turn object into array so that it can be sorted
    var owner_trackers = [];
    for (var k in owner_map) {
      owner_trackers.push([k, owner_map[k]]);
    }

    // order by owner name FIRST, then by number of projects
    owner_trackers.sort(function(a, b) {
      if ($scope.current_person && $scope.current_person.github_account && a[0] === $scope.current_person.github_account.login) {
        return -1;
      } else if ($scope.current_person && $scope.current_person.github_account && b[0] === $scope.current_person.github_account.login) {
        return 1;
      } else {
        return a[1].length === b[1].length ? 0 : (a[1].length < b[1].length ? 1 : -1);
      }
    });

    $scope.all_trackers = owner_trackers;
    return owner_trackers;
  });

  $scope.plugins_promise = $api.tracker_plugins_get().then(function(plugins) {
    // Get the plugin for a tracker, if installed.
    // if not installed, return model for a new plugin
    $scope.tracker_plugins_count = plugins.length;
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
          $scope.plugin_alert = { text: 'Changes successfully saved.', type: 'success', initial_message: true};
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
              $scope.plugin_alert = { text: 'Plugin successfully installed.', type: 'success', initial_message: true};
            }
          });
        }
      }
    };

    $scope.plugins = plugins;
    return plugins;
  });
});
