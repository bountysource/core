'use strict';

angular.module('app').controller('BaseToolsController', function ($scope, $routeParams, $window, $location, $api) {
  // Render a re-authorize link in the presence of the glorious authorize parameter.
  if (parseInt($routeParams.reauthorize, 10) === 1) {
    $scope.reAuthorize = true;
  }

  $scope.checkboxClick = function(check_all, $event) {
    // enables the checkbox in the accordion header to be checked
    $event.stopPropagation();

    // Check all
    for (var i=0; i < $scope.all_trackers.length; ++i) {
      for (var j = 0; j < $scope.all_trackers[i][1].length; j++) {
        $scope.all_trackers[i][1][j].selected = !check_all;
        if($scope.plugin_installed($scope.all_trackers[i][1][j]) || $scope.all_trackers[i][1][j].$plugin_installed) {
          $scope.current_plugin = $scope.get_plugin($scope.all_trackers[i][1][j]);
        }
      }
    }
  };

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

    // Find and returns selected inputs
    $scope.get_selected_trackers = function() {
      var selected = 0;
      for (var i=0; i < $scope.all_trackers.length; ++i) {
        for (var j = 0; j < $scope.all_trackers[i][1].length; j++) {
          if($scope.all_trackers[i][1][j].selected) {
            selected++;
          }
        }
      }
      return selected;
    };

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

    $scope.selected_trackers = function() {
      var selected_trackers = [];
      for (var i = 0; i < $scope.all_trackers.length; ++i) {
        for (var j = 0; j < $scope.all_trackers[i][1].length; j++) {
          if($scope.all_trackers[i][1][j].selected) {
            selected_trackers.push($scope.all_trackers[i][1][j]);
          }
          if($scope.all_trackers[i][1][j].$installed) {
            $scope.current_plugin = $scope.get_plugin($scope.all_trackers[i][1][j]);
          }
        }
      }
      return selected_trackers;
    };

    $scope.create_plugin = function() {
      var selected_trackers = $scope.selected_trackers();

      if ($scope.get_selected_trackers() > 0) {

        if (!$scope.__can_use_plugin__) {
          // redirect through github to get public repo permission
          $scope.github_auth($location.path() + "?tracker=" + ($scope.current_tracker || {}).full_name);
        } else {
          try {
            angular.forEach(selected_trackers, function(tracker) {
              if(!$scope.plugin_installed(tracker)) {  // Install plugin
                $scope.plugin_loading = "Installing plugin for " + tracker.full_name;

                $api.tracker_plugin_create(tracker.id, $scope.new_plugin).then(function(plugin) {

                  if (plugin.error) {
                    throw plugin.error;
                  }

                  tracker.$plugin_installed = true;
                  $scope.expand_tracker($scope.current_tracker);
                  plugins.push(plugin);
                  $scope.plugin_alert = { text: 'Plugin successfully installed.', type: 'success', initial_message: true};
                });

              } else {  // Update plugin

                var payload = {
                  modify_body: $scope.current_plugin.modify_body,
                  modify_title: $scope.current_plugin.modify_title,
                  add_label: $scope.current_plugin.add_label,
                  label_name: $scope.current_plugin.label_name,
                  label_color: $scope.current_plugin.label_color
                };

                var plugin = $scope.current_plugin;
                $scope.plugin_loading = "Updating plugin for " + tracker.full_name;

                $api.tracker_plugin_update(tracker.id, payload).then(function(updated_plugin) {
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
              }
            });

            // Finished updating plugins
            $scope.plugin_loading = false;
          } catch (exception) {
            $scope.plugin_alert.text = exception;
          }
        }
      }
    };

    $scope.plugins = plugins;
    return plugins;
  });
});
