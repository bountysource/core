angular.module('activity').
  service('taxFormSvc', function() {
    // Initialized in the new cashout process.
    var obj = {
      cashOut: null,
      deferredCashout: null,
      data: null,
      currentForm: null,
      init: function(cashOut, deferred) {
        obj.cashOut = cashOut;
        obj.deferred = deferred;
      }
    };

    return obj;
  }).

  controller("Fw9Controller", function ($scope, taxFormAddress, taxFormSvc) {
    $scope.data = taxFormSvc.data
    $scope.taxFormSvc = taxFormSvc;

    $scope.$watch('taxForm', function () {
      taxFormSvc.currentForm = $scope.taxForm;
    });

    $scope.$watch('data.tax_class', function() {
      var options = ["individual", "llc", "corp_c", "corp_s", "partnership", "trust", "other"];
      var valid = options.indexOf($scope.data.tax_class) >= 0;

      $scope.taxForm.tax_class.$setValidity( 'required', valid );
    });

    // taxFormSvc.cashOut may be already set by in validateTaxForm in cashOuts/new.js, if unset it is requested in TaxFormController and may be set later 
    // So best watch for a change to taxFormSvc.cashOut
    $scope.$watch('taxFormSvc.cashOut', function(cashout) {
      if(!cashout) return;

      if(cashout.address) {
        $scope.data.personal_name = cashout.address.name;
        $scope.data.address_1 = taxFormAddress.address1(cashout.address);
        $scope.data.address_2 = taxFormAddress.address2(cashout.address);
      }
    });
  }).

  controller("Fw8Controller", function ($scope, taxFormAddress, taxFormSvc) {
    $scope.taxFormSvc = taxFormSvc;
    $scope.data = taxFormSvc.data;

    $scope.$watch('data.signed', function (val) {
      $scope.data.print_signed = val;
    });

    $scope.$watch('taxForm', function () {
      taxFormSvc.currentForm = $scope.taxForm;
    });

    $scope.$watch('taxFormSvc.cashOut', function(cashout) {
      if(!cashout) return;

      if(cashout.address) {
        $scope.data.personal_name = cashout.address.name;
        $scope.data.residence_address_1 = taxFormAddress.address1(cashout.address);
        $scope.data.residence_address_2 = taxFormAddress.address2(cashout.address);
        $scope.data.citizen_of = $scope.data.residence_country = taxFormAddress.country(cashout.address);
      }

      if(cashout.mailing_address) {
        $scope.data.residence_address_1 = taxFormAddress.address1(cashout.mailing_address);
        $scope.data.residence_address_2 = taxFormAddress.address2(cashout.mailing_address);
        $scope.data.residence_country = taxFormAddress.country(cashout.mailing_address);
      }
    });
  }).

  controller('TaxFormController', function ($scope, $api, $location, $q, taxFormSvc) {
    $api.v2.taxDetails().then(function (response) { 
      if (response.data.tax_form_approved) { 
        $location.path('/activity/cash_outs');
      }
    });

    $scope.taxFormSvc = taxFormSvc;

    var taxFormData = {
      fw9: {
        form_type: "fw9", personal_name: null, business_name: null,
        tax_class: "individual", llc_type: null, other_text: null,
        payee_exemption: null, fatca_exemption: null, list_ac_numbers: null,
        address_1: null, address_2: null, requester: "Bountysource Inc.,\nCalifornia,\nU.S.A.",
        ssn: null, employee_id: null, signed: null, dated: null
      },
      fw8: {
        form_type: "fw8ben", personal_name: null, citizen_of: null,
        residence_address_1: null, residence_address_2: null, residence_country: null,
        mail_address_1: null, mail_address_2: null, mail_country: null,
        us_tax_id: null, foreign_tax_id: null, ref_num: null, date_of_birth: null, list_ac_numbers: null,
        ptii_country: null, ptii_treaty_para: null, ptii_withholding: null,
        ptii_income_type: null, ptii_eligibility_1: null, ptii_eligibility_2: null,
        signed: null, dated: null, print_signed: null, proxy_signers_role: null,
      }
    };

    // Zoom level watched by taxFormStyle, taxFormClearBg, taxFormHitBox and taxFormPdf directives
    $scope.formZoom = 1.8;

    // Used in tax_form.html
    $scope.errorTemplate = null;
    $scope.formTemplate = null;

    // Watched by the taxFormPdf directive
    $scope.pdfUrl = null;

    $scope.$watch('isUsCitizen', function (isUsCitizen) {
      if (isUsCitizen) {
        taxFormSvc.data = taxFormData.fw9;
        $scope.errorTemplate = "app/activity/cashOuts/tax_form/fw9_errors.html";
        $scope.formTemplate = "app/activity/cashOuts/tax_form/fw9_form.html";
        $scope.pdfUrl = "/assets/pdfjs/fw9.pdf";
      } else {
        taxFormSvc.data = taxFormData.fw8;
        $scope.errorTemplate = "app/activity/cashOuts/tax_form/fw8_errors.html";
        $scope.formTemplate = "app/activity/cashOuts/tax_form/fw8_form.html";
        $scope.pdfUrl = "/assets/pdfjs/fw8ben.pdf";
      }
    });

    $scope.$watch('taxFormSvc.cashOut', function(cashout) {
      if(cashout)
        $scope.isUsCitizen = cashout.us_citizen || cashout.address.country == 'US';
    });
    
    // If user has navigated here directly the taxFormSvx will not be initialised, try using a previous cashout to semi-complete form.
    if(!taxFormSvc.cashOut) {
      $scope.isUsCitizen = true;

      $api.v2.cashOuts().then(function (response) {
        var deferred = $q.defer();

        if(!response.success || !response.data.length) {
          deferred.reject();
        } else {
          deferred.resolve(response.data[0]);
        }

        return deferred.promise;
      }).then(function(cashout) {
        $api.v2.addresses().then(function(response) {
          if (!response.success) return;

          function matchAddress(id) {
            if(!id) return null;

            var match = response.data.filter(function(address){ return address.id == id });

            return match.length ? match[0] : null;
          }
          
          cashout.address = matchAddress(cashout.address_id);
          cashout.mailing_address = matchAddress(cashout.mailing_address_id);

          taxFormSvc.cashOut = cashout;
        });
      });
    };

    $scope.$watch('taxFormSvc.currentForm', function(currVal, prevVal) {
      $scope.activeTaxForm = taxFormSvc.currentForm;
      $scope.$broadcast('focusOn', "personal_name");
    });

    $scope.$on('focusOnFirstError', function() {
      for(var i in taxFormSvc.data) {
        if(taxFormSvc.currentForm[i] && taxFormSvc.currentForm[i].$invalid) {
          $scope.$broadcast('focusOn', i);
          return;
        }
      }
    });

    // If user navigates away from page no need to resolve the promise to complete the cashout
    var unregisterRouteListener = $scope.$on('$routeChangeStart', function() {
      if(taxFormSvc.deferredCashout)
        taxFormSvc.deferredCashout.reject();
    });

    $scope.submitTaxForm = function () {
      $scope.activeTaxForm.$submitted = true;

      if(!taxFormSvc.currentForm.$valid) {
        $scope.$broadcast('focusOnFirstError');
        return;
      }

      $scope.isSubmitting = true;

      $api.v2.submitTaxForm(taxFormSvc.data).then(function(response){ $scope.isSubmitting = false; })

      // Form already valid so just complete the cashout without waiting for a reply (as the form backup is slow)
      if(taxFormSvc.deferredCashout) {
        unregisterRouteListener();
        taxFormSvc.deferredCashout.resolve();
      } else {
        $location.path('/activity/cash_outs');
      }

      // .then(function(response) {
      //     $scope.isSubmitting = false;
      //     // The deferred object completes the cashout submission, resolves to createCashout() in new.js
      //     if(taxFormSvc.deferredCashout) {
      //         unregisterRouteListener();
      //         taxFormSvc.deferredCashout.resolve();
      //     }
      // });
    }
  });