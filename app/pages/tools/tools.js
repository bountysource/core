'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/tools', {
        templateUrl: 'pages/tools/tools.html',
        controller: 'ToolsController',
        resolve: $person
      });
  })
  .controller('ToolsController', function ($scope, $routeParams, $window, $api) {
    $scope.selected_relation = null;

    $api.tracker_relations_get().then(function(relations) {
      $scope.relations = relations;
      $scope.init_relations($scope.relations);
    });

    $scope.init_relations = function(relations) {
      for (var i in relations) { $scope.init_relation(relations[i]); }
    };

    $scope.init_relation = function(relation) {
      relation.select = function() {
        $scope.selected_relation = relation;
        if (!$scope.hide_info) $scope.hide_info = true;

        // add model representing the plugin
        relation.$tracker_plugin = {};

        // add flag set when waiting for plugin to be installed
        relation.$installing_plugin = false;

        // add install plugin method
        relation.install_plugin = function() {
          relation.$installing_plugin = true;

          $api.tracker_plugin_create(relation.project.id, relation.linked_account.id).then(function(new_relation) {
            // find and update the relation
            for (var i=0; i<$scope.relations.length; i++) {
              if ($scope.relations[i].id == new_relation.id) {
                for (var k in new_relation) { $scope.relations[i][k] = new_relation[k]; }
                $scope.init_tracker_plugin($scope.relations[i]);
                break;
              }
            }
            relation.$installing_plugin = false;
          });
        };

        // add update method to tracker plugin
        $scope.init_tracker_plugin(relation);

        // lastly, scroll to the top so that you can see the manage box
        $window.scrollTo(0,0);
      };
    };

    $scope.init_tracker_plugin = function(relation) {
      if (relation.project.tracker_plugin) {
        // create a master copy, for reverting changes
        relation.project.$tracker_plugin_master = angular.copy(relation.project.tracker_plugin);

        relation.project.tracker_plugin.close = function() {
          $scope.selected_relation = null;
          $scope.hide_info = false;
        };

        relation.project.tracker_plugin.update = function() {
          $api.tracker_plugin_update(relation.project.id, relation.project.tracker_plugin).then(function(updated_relation) {
            $scope.tracker_plugin_alert = { type: "success", message: ("Saved plugin options for "+relation.project.name) };

            relation.project.$tracker_plugin_master = angular.copy(updated_relation.project.tracker_plugin);
            for (var k in updated_relation) {
              relation.project.$tracker_plugin_master[k] = updated_relation[k];
            }
            relation.project.tracker_plugin.close();
          });
        };

        relation.project.tracker_plugin.reset = function() {
          for (var k in relation.project.$tracker_plugin_master) {
            relation.project.tracker_plugin[k] = relation.project.$tracker_plugin_master[k];
          }
        };

        relation.project.tracker_plugin.is_changed = function() {
          return angular.equals(relation.project.tracker_plugin, relation.project.$tracker_plugin_master);
        };
      }
    };

    $scope.relations_order = function(relation) {
      if (relation.type === 'owner') return 2;
      if (!angular.isUndefined(relation.type)) return 1;
      return 0;
    };

    $scope.filter_options = {};
    $scope.relations_filter = function(relation) {
      if ($scope.filter_options.text) {
        var regexp = new RegExp(".*?"+$scope.filter_options.text+".*?", "i");
        return regexp.test(relation.project.name) || regexp.test(relation.project.full_name) ;
      }
      return true;
    };
  });


