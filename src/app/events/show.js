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
  });

  $api.v2.backers({
    order: '+amount',
    per_page: 10
  }).then(function(response) {
    $scope.topBackers = angular.copy(response.data);
  });

});
