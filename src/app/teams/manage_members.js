'use strict';

angular.module('app').controller('ManageTeamMembersController', function($scope, $routeParams, $location, $api, $window) {
  $scope.$watch('is_admin', function(value) {
    if (value === false) {
      $location.path("/teams/"+$routeParams.id).replace();
    }
  });

  $scope.add_member_error = {};

  $scope.members_promise.then(function(members) {
    if (!members) { return; }

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

    // logic to process attribute updates and update UI. Used for budget updates and team role updates.
    function process_update (member, payload, type) {
      member[type === 'budget' ? '$budget_saving' : '$saving'] = true;
      $api.team_member_update($routeParams.id, member.id, payload).then(function(response) {
        member[type === 'budget' ? '$budget_saving' : '$saving'] = false;
        if ('error' in response) {
          delete member.$saved_at;
          $scope.cancel_member_changes(member);
          member[type === 'budget' ? '$budget_update_error' : '$update_error'] = response.error;
        } else {
          delete member.$update_error;
          member[type === 'budget' ? '$budget_saved_at' : '$saved_at'] = new Date();
          member.new_budget = false;
          //hacky way to update balance after succesfully reloading of budget
          if (type === 'budget') {
            member.balance = response.balance;
            member.budget = response.budget;
          }
          member.$master = angular.copy(member);
          member.$dirty = false;
        }
      });
    }

    $scope.update_member = function(member) {
      var payload = {
        admin: member.is_admin,
        developer: member.is_developer,
        public: member.is_public
      };
      if (member.id === $scope.current_person.id) {
        $scope.is_admin   = member.is_admin;
        $scope.is_developer = member.is_developer;
        $scope.is_public  = member.is_public;
      }
      process_update(member, payload, 'privileges');
    };

    $scope.update_budget = function (member) {
      var payload = {
        budget: member.budget
      };
      process_update(member, payload, 'budget');
    };

    $scope.delete_budget = function (member) {
      var payload = {
        budget: null
      };
      process_update(member, payload, 'budget');
    };

    $scope.creating_new_budget = function (member) {
      if (member.budget === member.$master.budget || member.budget === 0) {
        member.new_budget = false;
      } else if (member.budget > 0) {
        member.new_budget = true;
      }
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
    };
  };

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

  $api.team_invites_get($routeParams.id).then(function(invites) {
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
          if (new_invite.meta.success) {
            invites.push(new_invite.data);
          } else if (new_invite.meta.status === 422) {
            $scope.add_member_error = {
              message: request_data.email + " has already been sent an invitation!",
              type: "info"
            };
          }
        });
      }
      $scope.reset_member_form();
    };

    $scope.pending_invites = invites;
    return invites;
  });
});
