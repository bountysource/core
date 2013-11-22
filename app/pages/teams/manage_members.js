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
    $scope.$watch('is_admin', function(value) {
      if (value === false) {
        $location.path("/teams/"+$routeParams.id).replace();
      }
    });

    $scope.add_member_error = {};

    $scope.members.then(function(members) {
      // initialize master
      for (var i=0; i<members.length; i++) {
        members[i].$master = angular.copy(members[i]);
        members[i].$dirty = false;
      }

      $scope.member_changed = function(member) {
        var master = angular.copy(member.$master);
        delete master.$master;
        delete master.$dirty;
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
          developer: member.is_developer,
          public: member.is_public
        };

        member.$master = angular.copy(member);
        member.$dirty = false;

        if (member.id === $scope.current_person.id) {
          $scope.is_admin   = member.is_admin;
          $scope.is_developer = member.is_developer;
          $scope.is_public  = member.is_public;
        }

        member.$saving = true;
        $api.team_member_update($routeParams.id, member.id, payload).then(function() {
          member.$saving = false;
          member.$saved_at = new Date();
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

      $scope.add_member = function() {
        $scope.add_member_error.message = "";
        var request_data = angular.copy($scope.new_member);
        delete request_data.registered;

        $api.team_member_add($routeParams.id, request_data).then(function(new_member) {
          // make sure this person is not already a member (the API call is idempotent, no worries)
          for (var i=0; i<members.length; i++) {
            if (members[i].id === new_member.id) {
              $scope.add_member_error = {
                message: new_member.display_name + " is already a member of the team!",
                type: "info"
              };
              return;
            }
          }

          // if you got here, the is not part of the team.
          // reset form and push onto members.
          $scope.new_member.email = "";
          members.push(new_member);
          //initialize master and dirty attributes
          members[members.length - 1].$master = angular.copy(members[i]);
          members[members.length - 1].$dirty = false;
        });
      };
    });

    $scope.reset_member_form = function() {
      $scope.new_member = {
        email: "",
        public: true,
        admin: false,
        developer: true,
        registered: false
      }
    }

    $scope.reset_member_form();

    $scope.checked_emails = {};

    $scope.$watch("new_member.email", function(email) {
      if (email) {
        if ($scope.checked_emails[email]) {
          $scope.new_member.registered = $scope.checked_emails[email];
        } else {
          $api.email_registered(email).then(function(response) {
            $scope.checked_emails[email] = response.registered;
            $scope.new_member.registered = response.registered;
          });
        }
      } else {
        $scope.new_member.registered = false;
      }
    });

    $scope.pending_invites = $api.team_invites_get($routeParams.id).then(function(invites) {
      $scope.team_invite_reject = function(invite) {
        if ($window.confirm("Are you sure you want to revoke this invite?")) {
          $api.team_invite_reject($routeParams.id, invite.token).then(function() {
            for (var i=0; i<invites.length; i++) {
              if (invites[i].token === invite.token) {
                invites.splice(i,1);
                break;
              }
            }
          });
        }
      };

      $scope.team_invite_create = function() {
        if ($scope.new_member.registered) {
          // if the email is already registered with a bountysource account, just add them to the team
          $scope.add_member();

        } else {
          // email not registered with bountysource, send invite email
          var request_data = angular.copy($scope.new_member);
          delete request_data.error;
          delete request_data.registered;
          $api.team_invite_create($routeParams.id, request_data).then(function(new_invite) {
            invites.push(new_invite);
          });
        }
        $scope.reset_member_form();
      };

      return invites;
    });
  });