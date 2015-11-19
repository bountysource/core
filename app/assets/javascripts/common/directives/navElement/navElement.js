'use strict';

angular.module('directives').directive('navElement', function() {

  return {
    restrict: 'EAC',
    templateUrl: 'common/directives/navElement/navElement.html',
    scope: { navElement: '=' },
    replace: true
  };

});