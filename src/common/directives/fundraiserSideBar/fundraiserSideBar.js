'use strict';

/*
* Options:
*
* pledgeButtons - show the pledge buttons
* topBackers - show the top 3 backers of the fundraiser
* author - show the author of the fundraiser
* progress - show the progress info
* rewards - show the rewards
* shareButtons - show the share buttons. such social
* */
angular.module('directives').directive('fundraiserSideBar', function() {
  return {
    restrict: 'EAC',
    templateUrl: 'common/directives/fundraiserSideBar/templates/fundraiserSideBar.html',
    scope: {
      fundraiser: '=',
      options: '='
    },
    replace: true,
    link: function(scope) {
      scope.$options = {
        pledgeButtons: true,
        topBackers: true,
        author: true,
        progress: true,
        rewards: true,
        shareButtons: true
      };

      // Merge default options with those specified by the developer
      if (angular.isObject(scope.options)) {
        angular.extend(scope.$options, scope.options);
      }
    }
  };
});