angular.module('directives').directive('contributeAccordian', function ($rootScope, $api, $routeParams, Issue, Bounties) {
  return {
    restrict: 'EAC',
    replace: false,
    transclude: true,
    templateUrl: 'app/directives/issues/contributeAccordian/contributeAccordian.html',
    link: function(scope) {

      scope.generate_address = function(issue_id){
        $api.issue_address_create(issue_id).then(function(issue){
          if(web3.currentProvider.isMetaMask && scope.isSelectedCrypto('ETH')) {
            scope.issue = issue
            scope.openMetamaskModal()
          } else {
            scope.openQRModal()
          }
        })
      }
    }
  };
});
