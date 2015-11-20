angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/people/:id', {
    templateUrl: 'admin/people/show.html',
    controller: "PeopleShow"
  });
})
.controller("PeopleShow", function ($scope, $route, $api, $routeParams) {

  $api.get_person($routeParams.id).then(function(response) {
    $scope.person = response;
  });

  $api.get_teams({ person_id: $routeParams.id }).then(function(response) {
    $scope.teams = response.data;
  });

  $api.get_tags({ person_id: $routeParams.id }).then(function(response) {
    $scope.tag_votes = response.data;
  });

  $api.call('/admin/events', { person_id: $routeParams.id }, function(response) {
    $scope.events = response.data;
  });

  $scope.team_payins = $api.call("/admin/team_payins", { person_id: $routeParams.id });

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

});
