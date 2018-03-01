angular.module('app').directive('cashOutTable', function($api, $window) {

  return {
    restrict: 'EAC',
    templateUrl: 'admin/cash_outs/directives/cashOutTable.html',
    scope: { cashOuts: '=', options: '&' },
    link: function(scope) {

      scope.parseFloat = $window.parseFloat;

      scope._options = angular.extend({
        markAsSentButton: true
      }, scope.options() || {});

      scope.markAsSent = function(index) {
        if ($window.confirm("Are for REAL?")) {
          $api.call('/admin/cash_outs/'+scope.cashOuts[index].id, 'PUT', { sent: true }, function(response) {
            if (response.meta.status === 200) {
              scope.cashOuts.splice(index,1);
            } else {
              alert("Error: " + JSON.stringify(response));
            }
          });
        }
      };

      scope.markAsRefund = function(index) {
        if ($window.confirm("Refund back to person's account?")) {
          $api.call('/admin/cash_outs/'+scope.cashOuts[index].id, 'PUT', { refund: true }, function() {
            scope.cashOuts.splice(index,1);
          });
        }
      };

    }
  };

});
