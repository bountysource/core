'use strict';

angular.module('app')
  .controller('ChatroomController', function ($scope, $rootScope) {
    $scope.toggleChatroom = function() {
      $rootScope.showChatroom = !$rootScope.showChatroom;
    };
  });

