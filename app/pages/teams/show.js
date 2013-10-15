'use strict';

angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/teams/:id', {
    templateUrl: 'pages/teams/show.html',
    controller: 'BaseTeamController'
  });
})
.controller('TeamHomeController', function ($route, $scope, $routeParams, $api, $pageTitle, $location) {
  $scope.team.then(function (team) {
    $pageTitle.set(team.name, 'Teams');
  });

  $scope.submit_search = function (query_url, amount) {
    if (query_url.length > 0) {
      $api.search(query_url).then(function (response) {
        console.log(response);
        if (response.redirect_to) {
          var url = response.redirect_to;
          if (url[0] === '#') {
            url = '/' + url.slice(1);
          }
          url = url + "/bounty"; //take user directly to bounty create page

          //add in the amount params and redirect to create bounty page
          $location.path(url).search({ amount: amount});
        } else  if (response.create_issue) {
          $location.path("/issues/new").search({ url: query_url });
        } else {
          $location.path("/search").search({ query: query_url });
        }
      });
    }

  };

});
