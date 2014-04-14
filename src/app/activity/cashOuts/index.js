'use strict';

angular.module('activity').
  controller('CashOutsController', function($scope, $api) {

    $api.v2.cashOuts({
      include_mailing_address: true
    }).then(function(response) {
      $scope.cashOuts = angular.copy(response.data);
    });

  });