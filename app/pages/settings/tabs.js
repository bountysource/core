'use strict';

angular.module('app')
  .controller('SettingsTabs', function($scope, $location) {
    $scope.tabs = [
      { name: 'Public Profile', url: '/settings' },
      { name: 'Login and Password', url: '/settings/auth' },
      { name: 'Linked Accounts', url: '/settings/linked' },
      { name: 'Email Settings', url: '/settings/email' },
      { name: 'Project Plugins', url: '/settings/project' }
    ];
    $scope.is_active = function(url) {
      return url == $location.path();
    };

  });
