angular.module('app').controller('SessionButtons', function($scope, $state, $api, $window) {
  $scope.link_with_provider = function(provider) {
    $window.location.href = $api.oauth_url(provider, {
      redirect_url: $state.href('root.session.signup', {}, { absolute: true, inherit: false })
    });
  };
});
