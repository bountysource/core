/*
* Default options to extend when defining routes.
* We seem to use `reloadOnSearch: false` everywhere, so I am defining this constant to inherit options from so that it
* defaults to false.
* */
angular.module('constants').constant('defaultRouteOptions', {
  reloadOnSearch: false
});