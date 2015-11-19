'use strict';

angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.settings', {
    abstract: true,
    title: "Settings",
    templateUrl: "salt/settings/base.html"
  });
});
