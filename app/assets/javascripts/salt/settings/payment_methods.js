angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.settings.payment_methods', {
    url: "/settings/payment_methods",
    title: "Payment Methods",
    templateUrl: "salt/settings/payment_methods.html",
    controller: function($scope, payment_methods) {
      $scope.payment_methods = payment_methods;
    },
    resolve: {
      payment_methods: function($api) {
        return $api.payment_methods.query().$promise;
      }
    }
  });
});
