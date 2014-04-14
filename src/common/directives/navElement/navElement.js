'use strict';

angular.module('directives').directive('navElement', function() {

  return {
    restrict: 'EAC',
    templateUrl: 'common/directives/navElement/templates/navElement.html',
    scope: { navElement: '=' },
    replace: true
  };

});