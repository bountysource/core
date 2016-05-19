angular.module('app')
.config(function ($routeProvider) {


  $routeProvider.when('/admin/people/:id', { templateUrl: 'admin/people/show_info.html', controller: function ($scope, $route, $api, $routeParams) {
    $scope.person_id = $routeParams.id;
    $scope.person = $api.get_person($routeParams.id);
    $scope.selected_tab = 'info';

    $api.get_teams({ person_id: $routeParams.id }).then(function(response) {
      $scope.teams = response.data;
    });

    $scope.deleteAccount = function(person) {
      var response = prompt("Type DELETE below if you really want to delete everything for: " + person.display_name);

      if (response === 'DELETE') {
        $scope.deleting_in_progress = true;
        $api.delete_person(person.id).then(function(response) {
          if (response.error) {
            $scope.error = response.data.error;
          } else {
            $api.get_person($routeParams.id).then(function(response) {
              $scope.person = response;
              $scope.deleting_in_progress = false;
            });
          }
        });
      } else {
        alert("SYKE, just kidding, didn't do anything.");
      }
    };


  }});


  $routeProvider.when('/admin/people/:id/bounties', { templateUrl: 'admin/people/show_bounties.html', controller: function ($scope, $route, $api, $routeParams) {
    $scope.person_id = $routeParams.id;
    $scope.person = $api.get_person($routeParams.id);
    $scope.selected_tab = 'bounties';

    $api.get_bounties({ person_id: $routeParams.id }).then(function(results) {
      $scope.bounties = results.data;
    });
  }});


  $routeProvider.when('/admin/people/:id/events', { templateUrl: 'admin/people/show_events.html', controller: function ($scope, $route, $api, $routeParams) {
    $scope.person_id = $routeParams.id;
    $scope.person = $api.get_person($routeParams.id);
    $scope.selected_tab = 'events';

    $api.call('/admin/events', { person_id: $routeParams.id }, function(response) {
      $scope.events = response.data;
    });
  }});


  $routeProvider.when('/admin/people/:id/financial', { templateUrl: 'admin/people/show_financial.html', controller: function ($scope, $route, $api, $routeParams) {
    $scope.person_id = $routeParams.id;
    $scope.person = $api.get_person($routeParams.id);
    $scope.selected_tab = 'financial';

    $scope.giftMoney = function(giftValue, person) {
      if (giftValue > 0) {
        if (confirm("Are you sure you want to gift $" + giftValue + " to " + person.display_name + "?")) {
          $api.gift_money(person.id, giftValue).then(function(response) {
            if (response.created_at) {
              $scope.success_message = "Successfully gifted!";
            } else {
              $scope.error = response.data.error;
            }
          });
        }
      } else {
        $scope.error = "Gift must be greater than zero!";
      }
    };

  }});


  $routeProvider.when('/admin/people/:id/misc', { templateUrl: 'admin/people/show_misc.html', controller: function ($scope, $route, $api, $routeParams) {
    $scope.person_id = $routeParams.id;
    $scope.person = $api.get_person($routeParams.id);
    $scope.selected_tab = 'misc';

    $api.get_tags({ person_id: $routeParams.id }).then(function(response) {
      $scope.tag_votes = response.data;
    });

    $api.get_fundraisers({ person_id: $routeParams.id }).then(function(results) {
      $scope.fundraisers = results.data;
    });

  }});


  $routeProvider.when('/admin/people/:id/salt', { templateUrl: 'admin/people/show_salt.html', controller: function ($scope, $route, $api, $routeParams) {
    $scope.person_id = $routeParams.id;
    $scope.person = $api.get_person($routeParams.id);
    $scope.selected_tab = 'salt';
  }});


  $routeProvider.when('/admin/people/:id/team_payins', { templateUrl: 'admin/people/show_team_payins.html', controller: function ($scope, $route, $api, $routeParams) {
    $scope.person_id = $routeParams.id;
    $scope.person = $api.get_person($routeParams.id);
    $scope.selected_tab = 'team_payins';

    $scope.team_payins = $api.call("/admin/team_payins", { person_id: $routeParams.id });
  }});

});
