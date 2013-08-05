'use strict';

angular.module('app')
  .controller('ChatController', function ($rootScope, $scope) {
    // this really doesn't belong here
    $rootScope.chatroom = {
      show: false,
      toggle: function() { $rootScope.chatroom.show = !$rootScope.chatroom.show; },
      nick: "Guest" + Math.ceil(Math.random() * 100000),
      url: "none",
      connect: function() { console.log($rootScope.chatroom.nick); $rootScope.chatroom.url = '/chat/?nick=' + $rootScope.chatroom.nick; }
    };

    $rootScope.$watch("current_person", function(current_person) {
      if (current_person) {
        $rootScope.chatroom.nick = $scope.sanitize_nick(current_person.display_name);
      }
    });

    $scope.sanitize_nick = function(nick) {
      return nick.replace(/\s+/g,'_').replace(/[^a-z0-9-_]/ig,'');
    };
  });
