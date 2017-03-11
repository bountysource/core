angular.module('app').controller('SettingsTabs', function($scope, $location) {
  $scope.tabs = [
    { name: 'Profile', url: '/settings' },
    { name: 'Accounts', url: '/settings/accounts' }
  ];
  $scope.is_active = function(url) {
    return url === $location.path();
  };
});
