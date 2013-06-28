'use strict';

angular.module('app')
  .service('$payment', function($rootScope, $location, $window,$log, $api, $cookieStore) {
      // currently only used for bounty and pledge creation.
      // $payment.create({ amount: 15, payment_method: 'google', ... }).process();

    this._default_options = {
      success: function(response) { console.log('Payment success', response); },
      error: function(response) { console.log('Payment error', response); },
      noauth: function(response) { console.log('Payment noauth', response); }
    };

    this.process = function(data, options) {
      options = angular.extend(angular.copy(this._default_options), options);

      $api.call("/payments", "POST", data, function(response) {
        if (response.meta.success) {
          if (data.payment_method === 'google') {
            // a JWT is returned, trigger buy
            $window.google.payments.inapp.buy({
              jwt: response.data.jwt,
              success: function(result) { $window.location = $rootScope.api_host + "payments/google/success?access_token="+$cookieStore.get('access_token')+"&order_id="+result.response.orderId; },
              failure: function(result) { console.log('Google Wallet: Error', result); }
            });
          } else {
            $window.location = response.data.redirect_url;
          }
          options.success(response);
        } else if (response.meta.status === 401) {
          options.noauth(response);
        } else {
          options.error(response);
        }
      });
    };
  });