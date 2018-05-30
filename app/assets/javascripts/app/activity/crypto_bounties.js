angular.module('activity').controller('CryptoBountiesController', function($scope, $routeParams, $api, $pageTitle) {
  $pageTitle.set('Crypto Bounties', 'Activity');

  $api.call("/user/crypto_bounties").then(function(crypto_bounties) {
    $scope.crypto_bounties = crypto_bounties;
    return crypto_bounties;
  });
});
