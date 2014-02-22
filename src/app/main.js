'use strict';

angular.module('app')
.controller('MainController', function ($scope, $location, $rootScope, $window, $pageTitle) {
  $rootScope.$on('$viewContentLoaded', function() {
    $scope.no_container = $location.path() === '/';
  });

  // change page title on change route
  $rootScope.$on('$routeChangeStart', function (event, current) {
    if (!current.$$route) {
      $pageTitle.set('Page Not Found');
    } else if (current.$$route.title) {
      $pageTitle.set(current.$$route.title);
    } else {
      $pageTitle.set();
    }
  });

    // initialize zendesk feedback button if not mobile
  if ($window.innerWidth > 979) {
    if (typeof(Zenbox) !== "undefined") {
      $window.Zenbox.init({
        dropboxID:   "20109324",
        url:         "https://bountysource.zendesk.com",
        tabTooltip:  "Feedback",
        tabImageURL: "https://images.zendesk.com/external/zenbox/images/tab_feedback.png",
        tabColor:    "#129e5e",
        tabPosition: "Left"
      });
    }
  }
});
