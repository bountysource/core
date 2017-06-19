angular.module('app')
.factory('taxFormAdmin', function(){
  var obj = {
    status: {},
    updating: {},
    add: function (form) { 
      if(form && form.id) {
        console.log('Set Status', form);
        obj.status[form.id] = obj.checkStatus(form) 
      }
    },

    setUpdating: function(form, is_updating) {
      if(form && form.id) {
        obj.updating[form.id] = is_updating;
      }
    },

    updated: function(form) {
      obj.setUpdating(form, false);
      
      obj.add(form);
    },

    checkStatus: function(tax_form) {
      if(!tax_form)
        return "none";
      else if(tax_form.approved)
        return "approved"
      else if (tax_form.checked)
        return "invalid"
      else
        return "unchecked"
    }
  };

  return obj;
})

.directive('taxFormSummary', function($api, $window, taxFormAdmin) {
  return {
    restrict: 'E',
    templateUrl: 'admin/cash_outs/directives/taxFormSummary.html',
    link: function(scope, elem, activeTaxForms) {
      scope.taxFormAdmin = taxFormAdmin;

      // scope.taxFormStatus = taxFormStatus(null);

      // Form to be displayed in the modal box
      scope.taxForm = null;

      // Switch modal box on/off
      scope.modalBox = false;

      // An error message displayed in the modal box when a pdf cannot be read, set by the taxFormLoadData directive
      scope.loadError = false;

      // Toggle the rejection reason text input
      scope.needRejectionReason = false;

      // The model for that input field
      scope.rejectionReason = "";

      scope.$watch('cashOut.tax_form', function() {
        taxFormAdmin.add(scope.cashOut.tax_form)
        // scope.taxFormStatus = taxFormStatus(scope.cashOut.tax_form);
      }, true);

      scope.openModal = function(taxForm) {
        scope.needRejectionReason = false;
        scope.taxForm = taxForm;
      }

      scope.closeModal = function() {
        scope.modalBox = false;
        scope.taxForm = null;
      }

      scope.focusOnReason = function() {
        var input = document.getElementById("rejection_reason");
        if(input) input.focus();
        return true;
      }

      scope.showReason = function() {
        scope.needRejectionReason = true;
      }

      scope.reject = function (taxForm, reason) {
        updateApproval(taxForm, false, reason);
      }

      scope.approve = function(taxForm) {
        updateApproval(taxForm, true);
      }

      function updateApproval(taxForm, approval, reason) {
        scope.closeModal();
        taxFormAdmin.setUpdating(taxForm, true);
        //activates the progress bar in when a form has been 

        $api.approve_tax_form(taxForm.id, approval, reason, function(response) {
          taxFormAdmin.updated(response.data);
        });
      }
    }
  }
})