'use strict';

angular.module('app.controllers').controller('SettingsTabs', ['$scope', '$location', function($scope, $location) {
  $scope.tabs = [
    { name: 'Profile', url: '/settings' },
    { name: 'Accounts', url: '/settings/accounts' },
    { name: 'Email', url: '/settings/email' }
  ];
  $scope.is_active = function(url) {
    return url === $location.path();
  };
}]);
