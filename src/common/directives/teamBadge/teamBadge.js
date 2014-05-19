'use strict';

angular.module('directives').directive('teamBadge', function ($rootScope) {
  return {
    restrict: 'EAC',
    scope: { id: '=', type: '@' },
    link: function (scope, element) {
      scope.$watch('id', function (id) {
        if (angular.isDefined(id)) {
          var imageElement = angular.element('<img />');
          imageElement.attr('src', $rootScope.api_host + 'badge/team?id=' + id + '&type=' + scope.type);
          element.after(imageElement);
          element.remove();
        }
      });
    }
  };
});