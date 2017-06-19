angular.module('app').directive('taxFormLoadData', function($api, $window) {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      scope.loadError = false

      $api.tax_form_pdf_base64(scope.taxForm.id, function(response) {
        if(response.data.success) { 
          elem[0].data = 'data:application/pdf;base64,' + response.data.pdf;
        } else {
          scope.loadError = response.data.error + ' ' + response.data.file_name
        }
      })
    }
  }
})  