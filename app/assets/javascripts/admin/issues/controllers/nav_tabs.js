angular.module('app').controller('IssueNavTabsController', function ($scope, $location, $api) {
  $scope.active_tab = function(name) {
    if (name === 'unpaid' && (/^\/issues\/unpaid$/i).test($location.path())) { return "active"; }
    if (name === 'open' && (/^\/issues\/open$/i).test($location.path())) { return "active"; }
    if (name === 'paid_out' && (/^\/issues\/paid_out$/i).test($location.path())) { return "active"; }
    if (name === 'all' && (/^\/issues$/i).test($location.path())) { return "active"; }
  };

  $api.issues_stats_count().then(function (response) {
    $scope.closed = response.closed;
    $scope.open = response.open;
    $scope.paid_out = response.paid_out;
  });

});
