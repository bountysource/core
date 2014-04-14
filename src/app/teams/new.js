'use strict';

angular.module('app').controller('NewTeamController', function ($scope, $location, $api, $filter, $routeParams, $pageTitle) {
  $pageTitle.set("Teams", "New");
});
