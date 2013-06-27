angular.module('app').controller('IssueNavTabsController', function($scope, $location) {
  $scope.active_tab = function(name) {
    if (name === 'overview' && (/^\/issues\/[a-z-_0-9]+$/i).test($location.path())) { return "active"; }
    if (name === 'comments' && (/^\/issues\/[a-z-_0-9]+\/comments$/).test($location.path())) { return "active"; }
    if (name === 'bounties' && (/^\/issues\/[a-z-_0-9]+\/bounties$/).test($location.path())) { return "active"; }
    if (name === 'solutions' && (/^\/issues\/[a-z-_0-9]+\/solutions$/).test($location.path())) { return "active"; }
  };
})