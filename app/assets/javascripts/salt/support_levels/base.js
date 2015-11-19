'use strict';

angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.support_levels', {
    abstract: true,
    template: '<ui-view/>'
  });
});
