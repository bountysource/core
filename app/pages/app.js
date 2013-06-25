'use strict';

angular.module('app', ['ui.bootstrap', 'api.bountysource', 'ngSanitize', 'ngCookies'])
  .config(function ($routeProvider, $locationProvider) {   //, $provide) {

    //  NOTE: uncomment to test hashbang # mode
    //  $provide.decorator('$sniffer', function($delegate) { $delegate.history = false; return $delegate; });

    $locationProvider.html5Mode(true);
    $routeProvider.otherwise({ templateUrl: 'pages/layout/not_found.html' });

    // HACK: transform old-style #urls into new style #/urls
    if ((window.location.hash||'').match(/^#[^/]/)) {
      window.location.hash = '#/' + window.location.hash.replace(/^#/,'');
    }
  }).run(function($api) {
    // load person from initial cookies
    $api.load_current_person_from_cookies();
  })

  // currently only used for bounty and pledge creation.
  // $payment.create({ amount: 15, payment_method: 'google', ... }).process();
  .service('$payment', function($rootScope, $location, $window,$log, $api, $cookieStore) {
    this._default_options = {
      success: function(response) { console.log('Payment success', response); },
      error: function(response) { console.log('Payment error', response); },
      noauth: function(response) { console.log('Payment noauth', response); }
    };

    this.process = function(data, options) {
      options = angular.extend(angular.copy(this._default_options), options);

      $log.info(data);

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
