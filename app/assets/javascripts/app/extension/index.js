angular.module('app').controller('ExtensionIndexController', function ($scope, $window, $api) {

  if ($window.chrome && $window.chrome.webstore) {
    $scope.can_install_extension = 'chrome';
  } else if (navigator.userAgent.match(/Firefox\/(\d+)/)) {
    $scope.can_install_extension = 'firefox';
  }

  // check periodically for the plugin
  $scope.extension_retries = 10;
  $scope.extension_installed = false;
  var check_for_plugin = function() {
    console.log("checking for extension install", $scope.extension_retries);
    if ($window.document.body.classList.contains('bountysource-thumbs-extension-is-installed')) {
      $scope.extension_installed = true;
      $scope.$digest();
      return;
    }
    if ($scope.extension_retries > 0) {
      $scope.extension_retries = $scope.extension_retries - 1;
      setTimeout(check_for_plugin, 500);
    }
  };
  setTimeout(check_for_plugin, 0);

  $scope.install_chrome_extension = function() {
    $window.chrome.webstore.install(
      "https://chrome.google.com/webstore/detail/gbglnjeiihigninohoiomjamaapnighb",
      function(response) { $scope.extension_installed = true; $scope.$digest(); },
      function(response) { console.log("error", response); }
    );
  };

  $scope.signin_with_github = function() {
    $window.document.location.href = $api.signin_url_for('github');
  };

});
