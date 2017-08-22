angular.module('activity').
  controller('CashOutsController', function($scope, $q, $api) {
    
    function hasPending(cashOuts) {
      for(var i = 0; i < $scope.cashOuts.length; i++) {
        if($scope.cashOuts[i].sent_at == null && $scope.cashOuts[i].is_refund == false) {
          return true;
        }
      }
      
      return false;
    }

    $api.v2.cashOuts({
      include_mailing_address: true
    }).then(function(response) {
      $scope.cashOuts = angular.copy(response.data);

      var deferred = $q.defer();
      if($scope.cashOuts.length > 0)
        deferred.resolve($scope.cashOuts);
      else
        deferred.reject();

    }).then(function(cashouts) {
      if(!hasPending(cashouts))
        return;

      $api.v2.taxDetails().then(function(response) {
        if(!response.data.tax_form_complete) {
          $scope.needTaxForm = 'incomplete';
        } else if (response.data.tax_form_checked && !response.data.tax_form_approved) {
          $scope.needTaxForm = 'invalid';
        }
      });
    });
  });