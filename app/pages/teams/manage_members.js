'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/teams/:id/members/manage', {
        templateUrl: 'pages/teams/manage_members.html',
        controller: 'BaseTeamController',
        resolve: $person
      });
  })
  .controller('ManageTeamMembersController', function($scope, $routeParams, $location, $api, $window) {
    $scope.new_member = { email: "", error: null };

    $scope.$watch('is_admin', function(value) {
      if (value === false) {
        $location.path("/teams/"+$routeParams.id).replace();
      }
    });

    $scope.members.then(function(members) {
      // initialize master
      for (var i=0; i<members.length; i++) {
        members[i].$master = angular.copy(members[i]);
        members[i].$dirty = false;
      }

      $scope.add_member = function() {
        $scope.new_member.error = null;

        $api.team_member_add($routeParams.id, $scope.new_member.email).then(function(member) {
          if (member.error) {
            $scope.new_member.error = member.error;
          } else {
            members.push(member);
          }
        });
      };

      $scope.member_changed = function(member) {
        var master = angular.copy(member.$master);

        delete master.$master;
        delete master.$dirty;

        console.log(master, member);

        member.$dirty = !angular.equals(member, master);
      };

      $scope.cancel_member_changes = function(member) {
        for (var k in member.$master) {
          member[k] = member.$master[k];
        }
        member.$master = angular.copy(member);
        member.$dirty = false;
      };

      $scope.update_member = function(member) {
        var payload = {
          admin: member.is_admin,
          spender: member.is_spender,
          public: member.is_public
        };
        $api.team_member_update($routeParams.id, member.id, payload).then(function(update_member) {
          console.log(update_member);

          for (var k in update_member) { member[k] = update_member[k]; }
          member.$master = angular.copy(update_member);
          member.$dirty = false;
        });
      };

      $scope.remove_member = function(member) {
        if ($window.confirm("Are you sure you want to remove " + member.display_name + " from the team?")) {
          $api.team_member_remove($routeParams.id, member.id).then(function() {
            // remove from the members list
            for (var i=0; i<members.length; i++) {
              if (members[i].id === member.id) {
                members.splice(i,1);
                break;
              }
            }
          });
        }
      };
    });
  });