'use strict';

angular.module('app').controller('EventShowController', function($scope, $routeParams, $document, $rootScope, $interval, $api) {

  // Kill the Zendesk thing when it pops up
  var zenboxWatcher = $interval(function() {
    var e = document.getElementById('zenbox_tab');
    if (e) {
      e.parentNode.removeChild(e);
      $interval.cancel(zenboxWatcher);
    }
  }, 10);

  // Kill the header
  var navbarWatcher = $interval(function() {
    var e = document.getElementById('navbar');
    if (e) {
      e.parentNode.removeChild(e);
      $interval.cancel(navbarWatcher);
    }
  }, 10);

  // Kill the footer
  var footerWatcher = $interval(function() {
    var e = document.getElementById('footer');
    if (e) {
      e.parentNode.removeChild(e);
      $interval.cancel(footerWatcher);
    }
  }, 10);

  $api.v2.event($routeParams.slug, {
    include_issues: true
  }).then(function(response) {
    $scope.event = angular.copy(response.data);
    for (var i=0; i < $scope.event.issues.length; i++) {
      $scope.event.issues[i].title = $scope.event.issues[i].title.replace(/ \[\$[0-9,]+]$/,'');
    }
  });

  $api.v2.backers({
    order: '+amount',
    per_page: 20
  }).then(function(response) {
    var excludedBackerIds = [
      22070,  // medovina,
      1,      // Bountysource team
      17827   // adrianroe
    ];

    $scope.topBackers = [];
    for (var i=0; $scope.topBackers.length < 8 && i<response.data.length; i++) {
      if (excludedBackerIds.indexOf(response.data[i].id) < 0) {
        $scope.topBackers.push(angular.copy(response.data[i]));
      }
    }
  });

});
