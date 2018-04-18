angular.module('app').controller("NavbarController", function ($scope, $auth) {
  $scope.logout = $auth.logout;
});

angular.module('app').controller('CanyaAnnouncementController', function ($scope, $cookieJar) {
  $scope.hideCanyaAnnouncement = function() {
    $scope.canyaAnnouncementIsVisible = false;
    $cookieJar.setJson('hide_canya_testing', true);
  };
  $scope.canyaAnnouncementIsVisible = !$cookieJar.getJson('hide_canya_testing');
});