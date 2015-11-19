'use strict';

angular.module('app').constant('$env', window.BS_ENV).run(function($rootScope, $env) {
  $rootScope.env = $env;
});
