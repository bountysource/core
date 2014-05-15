'use strict';

angular.module('directives').directive('issueBadge', function ($rootScope) {
  return {
    restrict: 'EAC',
    scope: { id: '=' },
    link: function (scope, element) {
      scope.$watch('id', function (id) {
        if (angular.isDefined(id)) {
          var imageElement = angular.element('<img />');
          imageElement.attr('src', $rootScope.api_host + 'badge/issue?id=' + id);
          element.after(imageElement);
          element.remove();
        }
      });
    }
  };
});