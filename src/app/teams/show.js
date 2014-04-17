'use strict';

angular.module('app').controller('TeamHomeController', function ($route, $scope, $routeParams, $api, $pageTitle, $location) {
  $scope.create_bounty_params = {};

  // pick off query string to show amount added to account
  if ($location.search().funds_added) {
    $scope.funds_added = parseInt($location.search().funds_added, 10) || undefined;
    $location.search({}).replace();
  }

  $scope.team_promise.then(function (team) {
    if(team) {
      // Set payment method on params so that team is the selected payment method on Bounty page
      $scope.create_bounty_params.checkout_method = "team/"+team.id;

      // Get top issues for the team
      $api.v2.issues({
        tracker_owner_type: "Team",
        tracker_owner_id: team.id,
        include_tracker: true,
        can_add_bounty: true,
        paid_out: false,
        order: "+bounty",
        page: 1,
        per_page: 5
      }).then(function (response) {
        $scope.issues = response.data;
      });
      $pageTitle.set(team.name, 'Teams');
    } else {
      $pageTitle.set("Team not found");
    }


    $scope.$watch('activeFundraiser', function(fundraiser) {
      if (fundraiser) {
        $api.v2.fundraiserUpdates({
          fundraiser_id: fundraiser.id
        }).then(function(response) {
          $scope.updates = angular.copy(response.data);
          return $scope.updates;
        });
      }
    });

    return team;
  });

  $scope.submit_search = function (query_url, amount) {
    $scope.create_bounty_params.amount = amount;

    if ((query_url || "").length > 0) {
      $api.search(query_url).then(function (response) {
        if (response.redirect_to) {
          var url = response.redirect_to;

          if (url[0] === '#') {
            url = '/' + url.slice(1);
          }
          url = url + "/bounty"; // take user directly to bounty create page

          //add in the amount params and redirect to create bounty page
          $location.path(url).search($scope.create_bounty_params);
        } else  if (response.create_issue) {
          $location.path("/issues/new").search({ url: query_url });
        } else {
          $location.path("/search").search({ query: query_url });
        }
      });
    }
  };
});
