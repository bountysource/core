angular.module('app').controller('IssueDevelopersController', function ($scope, $pageTitle, $api, $route, $routeParams, $location, $window, $analytics, $filter, $q, Issue, BountyClaim, Solution, DeveloperGoal, Bounties) {

  $scope.goToProfilePage = function(){
    $location.url("/settings/accounts");    
  };
  
  // shortcut
  var issue_id = parseInt($routeParams.id);

  var page_data = {
    initialize: function() {
      // update my_* objects if current_person is late to load
      $scope.$watch('current_person', page_data.process_resources);

      page_data.refresh_issue();
      page_data.refresh_bounty_claims();
      page_data.refresh_solutions();
      page_data.refresh_developer_goals();
      page_data.refresh_issue_suggestions();
    },

    refresh_issue: function() {
      $scope.issue = Issue.get({
        id: issue_id,
        include_tracker: true,
        include_counts: true,
        include_team: true,
        can_respond_to_claims: true
      }, function(issue) {
        $scope.team = issue.team;
        $pageTitle.set('Developers', $scope.issue.title, $scope.issue.tracker.name);
        page_data.process_resources();
      });
    },

    refresh_bounty_claims: function() {
      $scope.bounty_claims = BountyClaim.query({
        issue_id: issue_id,
        include_owner: true,
        include_responses: true
      });
      $scope.bounty_claims.$promise.then(page_data.process_resources);
      return $scope.bounty_claims.$promise;
    },

    refresh_solutions: function() {
      $scope.solutions = Solution.query({
        issue_id: issue_id,
        include_owner: true
      });
      $scope.solutions.$promise.then(page_data.process_resources);
      return $scope.solutions.$promise;
    },

    refresh_developer_goals: function() {
      $scope.developer_goals = DeveloperGoal.query({
        issue_id: issue_id,
        include_owner: true
      });
      $scope.developer_goals.$promise.then(page_data.process_resources);
      return $scope.developer_goals.$promise;
    },

    refresh_issue_suggestions: function() {
      $scope.issue_suggestions = $api.issue_suggestions.query({
        issue_id: issue_id
      });
      $scope.issue_suggestions.$promise.then(page_data.process_resources);
      return $scope.issue_suggestions.$promise;
    },

    is_resolved: function() {
      if (!$scope.issue.$resolved) {
        return false;
      } else if (!$scope.bounty_claims.$resolved) {
        return false;
      } else if (!$scope.solutions.$resolved) {
        return false;
      } else if (!$scope.developer_goals.$resolved) {
        return false;
      } else if (!$scope.issue_suggestions.$resolved) {
        return false;
      } else {
        return true;
      }
    },

    // looks at issue, claims, solutions, developer_goals... and makes sense of it all
    process_resources: function() {

      if (!page_data.is_resolved()) {
        return;
      }

      // preload my_response on bounty_claims for easier processing later
      if ($scope.current_person) {
        angular.forEach($scope.bounty_claims, function(bounty_claim) {
          angular.forEach(bounty_claim.responses, function(response) {
            if ($scope.current_person.id === response.owner.id) {
              bounty_claim.my_response = response;
              return;
            }
          });
        });
      }

      // organize objects into hash... key is owner and value is array of objects
      var objects_by_owner = {};
      var find_by_owner = function(owner) {
        if (!objects_by_owner[owner.type+owner.id]) {
          objects_by_owner[owner.type+owner.id] = [];
        }
        return objects_by_owner[owner.type+owner.id];
      };
      angular.forEach($scope.issue_suggestions, function(value, key) {
        var tweaked_value = angular.extend({}, value, {
          type: 'issue_suggestion',
          owner: value.person
        });
        find_by_owner(tweaked_value.owner).push(tweaked_value);
      });
      angular.forEach($scope.bounty_claims, function(value, key) {
        find_by_owner(value.owner).push(angular.extend({}, value, { type: 'bounty_claim' }));
      });
      angular.forEach($scope.solutions, function(value, key) {
        find_by_owner(value.owner).push(angular.extend({}, value, { type: 'solution' }));
      });
      if ($scope.issue.can_add_bounty) {
        angular.forEach($scope.developer_goals, function(value, key) {
          find_by_owner(value.owner).push(angular.extend({}, value, { type: 'developer_goal' }));
        });
      }

      // flatten all the events down
      $scope.developer_events = [];
      angular.forEach(objects_by_owner, function(events, person_tag) {
        $scope.developer_events = $scope.developer_events.concat(events);
      });

      // if any of the events are a collected bounty_claim, then we can ignore everything else
      $scope.developer_events_loaded = true;
      for (var i=0; i < $scope.developer_events.length; i++) {
        if ($scope.developer_events[i].type === 'bounty_claim' && $scope.developer_events[i].collected) {
          $scope.developer_events_awarded = true;
          $scope.developer_events = $filter('filter')($scope.developer_events, function(event) {
            if (event.type === 'bounty_claim') {
              // hack to put rejected bounty claims below accepted
              if (!event.collected) {
                event.updated_at = null;
              }
              return true;
            } else if (event.type === 'issue_suggestion') {
              return true;
            }
          });
          break;
        }
      }

      if ($scope.current_person) {
        var events = find_by_owner({ type: 'Person', id: $scope.current_person.id });
        $scope.my_bounty_claim = $filter('filter')(events, { type: 'bounty_claim' })[0];
        $scope.my_solution = $filter('filter')(events, { type: 'solution' })[0];
        $scope.my_developer_goal = $filter('filter')(events, { type: 'developer_goal' })[0];
      } else {
        $scope.my_bounty_claim = null;
        $scope.my_solution = null;
        $scope.my_developer_goal = null;
      }

      $scope.developer_form.data = {};
      if ($scope.issue.can_add_bounty) {
        if ($scope.my_solution && $scope.my_solution.status==='started') {
          $scope.developer_form.data.status = 'has_solution';
          $scope.developer_form.data.url = $scope.my_solution.url;
          $scope.developer_form.data.completion_date = $scope.my_solution.completion_date;
          $scope.developer_form.data.note = $scope.my_solution.note;
        } else if ($scope.my_developer_goal) {
          $scope.developer_form.data.status = 'has_goal';
          $scope.developer_form.data.developer_goal_amount = $scope.my_developer_goal.amount;

          // if they stopped and then restart, preload the form data
          if ($scope.my_solution) {
            $scope.developer_form.data.url = $scope.my_solution.url;
            $scope.developer_form.data.completion_date = $scope.my_solution.completion_date;
            $scope.developer_form.data.note = $scope.my_solution.note;
          }
        } else if ($scope.my_solution && $scope.my_solution.status==='stopped') {
          $scope.developer_form.data.status = 'has_stopped_solution';
          $scope.developer_form.data.url = $scope.my_solution.url;
          $scope.developer_form.data.completion_date = $scope.my_solution.completion_date;
          $scope.developer_form.data.note = $scope.my_solution.note;
        } else {
          $scope.developer_form.data.status = 'no_solution_no_goal';
        }
      } else {
        if ($scope.my_bounty_claim) {
          $scope.developer_form.data.status = 'claim_submitted';
          $scope.developer_form.data.url = $scope.my_bounty_claim.code_url;
          $scope.developer_form.data.note = $scope.my_bounty_claim.description;
        } else if ($scope.my_solution) {
          $scope.developer_form.data.status = 'claim_needed_has_solution';
          $scope.developer_form.data.url = $scope.my_solution.url;
        } else if (!$scope.my_solution) {
          $scope.developer_form.data.status = 'claim_needed_no_solution';
        }
      }

    }
  };


  var backer_form = $scope.backer_form = {
    accept_claim: function(bounty_claim) {
      $api.bounty_claim_accept(bounty_claim.id, bounty_claim.my_form_data.description).then(backer_form.bounty_claim_response_callback);
    },

    reject_claim: function(bounty_claim) {
      $api.bounty_claim_reject(bounty_claim.id, bounty_claim.my_form_data.description).then(backer_form.bounty_claim_response_callback);
    },

    resolve_claim: function(bounty_claim) {
      $api.bounty_claim_resolve(bounty_claim.id, bounty_claim.my_form_data.description).then(backer_form.bounty_claim_response_callback);
    },

    reset_claim: function(bounty_claim) {
      $api.bounty_claim_reset(bounty_claim.id, bounty_claim.my_form_data.description).then(backer_form.bounty_claim_response_callback);
    },

    start_response: function(bounty_claim, action) {
      bounty_claim.my_form_data = { action: action };
      if (bounty_claim.my_response) {
        bounty_claim.my_form_data.description = bounty_claim.my_response.description;
      }
    },

    cancel_response: function(bounty_claim) {
      bounty_claim.my_form_data = null;
    },

    bounty_claim_response_callback: function() {
      page_data.refresh_issue(); // TODO: only really needed when clicking accept as it might trigger a payout
      page_data.refresh_bounty_claims();
    }
  };






  var developer_form = $scope.developer_form = {

    visible: false,

    // where all the form data is stored
    data: {},

    statuses: function() {
      var retval = [];
      retval.push({ value: 'has_solution', label: 'In progress' });
      retval.push({ value: 'has_goal', label: 'Bounty too low' });
      //retval.push({ value: 'code_submitted', label: 'Code submitted' });

      if ($scope.my_solution) {
        retval.push({ value: 'has_stopped_solution', label: 'Stopped' });
      }
      return retval;
    },

    // if not logged in, send to login, else show form
    show: function() {
      if ($scope.current_person) {
        developer_form.previous_data = angular.copy(developer_form.data);
        developer_form.visible = true;
      } else {
        $api.set_post_auth_url($location.url());
        $location.url("/signin");
      }
    },

    // disappear the form
    hide: function() {
      developer_form.visible = false;
    },

    // disappear the form and restore previous data
    cancel: function() {
      developer_form.data = developer_form.previous_data;
      developer_form.hide();
    },

    // figure out what to do when the person clicks Save
    submit: function() {
      developer_form.error = null;

      if (developer_form.data.status === 'has_goal') {
        developer_form.set_developer_goal();
      } else if (developer_form.data.status === 'has_solution') {
        developer_form.update_solution();
      } else if (developer_form.data.status === 'has_stopped_solution') {
        developer_form.stop_solution();
      } else if (['claim_submitted','claim_needed_no_solution','claim_needed_has_solution'].indexOf(developer_form.data.status)>=0) {
        developer_form.update_claim();
      }
    },

    // helper method for submit()
    set_developer_goal: function() {
      var amount = developer_form.data.developer_goal_amount;

      DeveloperGoal.create({
        issue_id: issue_id,
        amount: amount
      }, function() {
        page_data.refresh_developer_goals().then(developer_form.hide);
        // NOTE: disabled... we no longer explicitly stop work if you set a goal
        // if ($scope.my_solution) {
        //   $api.stop_solution(issue_id).then(function() {
        //     page_data.refresh_developer_goals();
        //     page_data.refresh_solutions();
        //     $q.all([$scope.developer_goals.$promise, $scope.solutions.$promise]).then(developer_form.hide);
        //   });
        // } else {
        //   page_data.refresh_developer_goals().then(developer_form.hide);
        // }
      });

      $analytics.setBountyGoal(amount, issue_id);
    },

    delete_bounty_goal: function() {
      developer_form.data.developer_goal_amount = "";
      developer_form.set_developer_goal();
    },

    // helper method for submit()
    update_solution: function() {
      // var parsed_time = $window.moment(developer_form.data.completion_date);

      var data = { url: developer_form.data.url, completion_date: developer_form.data.completion_date, note: developer_form.data.note };

      if (!$scope.my_solution) {
        $api.start_solution(issue_id, data).then(developer_form.update_solution_callback);
      } else if ($scope.my_solution.status === 'stopped') {
        $api.restart_solution(issue_id, data).then(developer_form.update_solution_callback);
      } else {
        $api.update_solution(issue_id, data).then(developer_form.update_solution_callback);
      }
    },

    update_solution_callback: function(response) {
      if (response && response.error) {
        developer_form.error = response.error;
      } else {
        page_data.refresh_solutions().then(developer_form.hide);
      }
    },

    stop_solution: function() {
      $api.stop_solution(issue_id).then(developer_form.update_solution_callback);
    },

    update_claim: function() {
      var data = { code_url: developer_form.data.url, description: developer_form.data.note };

      if ($scope.my_bounty_claim) {
        $api.bounty_claim_update($scope.my_bounty_claim.id, data).then(developer_form.update_claim_callback);
      } else {
        $api.bounty_claim_create(issue_id, data).then(developer_form.update_claim_callback);
      }
    },

    delete_bounty_claim: function(bounty_claim) {
      if (confirm("Are you sure you want to delete this claim?")) {
        $api.bounty_claim_destroy(bounty_claim.id).then(developer_form.update_claim_callback);
      }
    },

    update_claim_callback: function(response) {
      if (response && response.error) {
        developer_form.error = response.error;
      } else {
        page_data.refresh_bounty_claims().then(developer_form.hide);
      }
    },

    show_date_picker: function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      developer_form.data.show_date_picker = true;
    },

    accept_issue_suggestion: function(event) {
      var thanked_reward = parseFloat(event.my_form_data.thanked_reward) || 0.0;
      var bounty_amount = parseFloat(event.my_form_data.bounty_amount) || 0.0;

      // shopping cart
      if (thanked_reward || bounty_amount) {

      // thanks only, no shopping cart
      } else {
        $api.issue_suggestions.update({
          id: event.id,
          thanked: true
        }, function(response) {
          page_data.refresh_issue_suggestions();
        });
      }
    },

    reject_issue_suggestion: function(event) {
      $api.issue_suggestions.update({
        id: event.id,
        rejected: true,
        rejection_reason: event.my_form_data.rejection_reason
      }, function(response) {
        page_data.refresh_issue_suggestions();
      });
    }
  };


  // kick everything off!
  page_data.initialize();
});
