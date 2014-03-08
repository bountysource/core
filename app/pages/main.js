'use strict';

angular.module('app')
.controller('MainController', function ($scope, $location, $rootScope, $window, $pageTitle, $twttr) {
  $rootScope.$on('$viewContentLoaded', function() {
    $scope.no_container = $location.path() === '/';
  });

  $scope.show_twitter_banner = function () {
    if ($location.path() === "/") {
      return false;
    } else {
      return true;
    }
  };

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
        tabImageURL: "https://assets.zendesk.com/external/zenbox/images/tab_feedback.png",
        tabColor:    "#129e5e",
        tabPosition: "Left"
      });
    }
  }
});
