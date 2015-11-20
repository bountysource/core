angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.teams.admin.updates', {
    abstract: true,
    template: "<ui-view/>"
  });
});
