'use strict';

angular.module('app')
  .controller('MainController', function ($scope, $location, $rootScope) {

    // this really doesn't belong here
    $scope.chatroom = {
      show: false,
      toggle: function() { $scope.chatroom.show = !$scope.chatroom.show; },
      nick: "Guest" + Math.ceil(Math.random() * 100000),
      url: "none",
      connect: function() { console.log($scope.chatroom.nick); $scope.chatroom.url = '/chat/?nick=' + $scope.chatroom.nick; }
    };

    $rootScope.$on('$viewContentLoaded', function() {
      $scope.no_container = $location.path() == '/';
    });
  });
