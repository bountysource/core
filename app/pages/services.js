'use strict';
angular.module('app')
  .service('$payment', function ($rootScope, $location, $window, $log, $api, $cookieStore) {
    // currently only used for bounty and pledge creation.
    // $payment.create({ amount: 15, payment_method: 'google', ... }).process();
    // NOTE: also used to add money to teams!
    this._default_options = {
      success: function (response) {
        console.log('Payment success', response);
      },
      error: function (response) {
        console.log('Payment error', response);
      },
      noauth: function (response) {
        console.log('Payment noauth', response);
      }
    };
    this.process = function (data, options) {
      options = angular.extend(angular.copy(this._default_options), options);

      $api.call("/payments", "POST", data, function (response) {
        if (response.meta.success) {
          if (data.payment_method === 'google') {
            // a JWT is returned, trigger buy
            $window.google.payments.inapp.buy({
              jwt:     response.data.jwt,
              success: function (result) {
                $window.location = $rootScope.api_host + "payments/google/success?access_token=" + $cookieStore.get($api.access_token_cookie_name) + "&order_id=" + result.response.orderId;
              },
              failure: function (result) {
                console.log('Google Wallet: Error', result);
              }
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
  })
  .service('$twttr', function ($window) {
    // Twitter script
    if (angular.isUndefined($window.twttr)) {
      (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
        if (!d.getElementById(id)) {
          js = d.createElement(s);
          js.id = id;
          js.src = p + "://platform.twitter.com/widgets.js";
          fjs.parentNode.insertBefore(js, fjs);
        }
      })(document, "script", "twitter-wjs");
    }
    var that = this;
    this.$$queue = [];
    this.$$enqueue = function () {
      var method = arguments;
      return function () {
        var args = arguments;
        that.$$queue.push([method, args]);
      };
    };
    // stub widgets with method to enqueue requests while
    // the sdk loads
    this.widgets = {
      load: this.$$enqueue('widgets', 'load')
    };
    // poll until twitter sdk loaded
    var poll = $window.setInterval(function () {
      if (angular.isDefined($window.twttr)) {
        clearInterval(poll);
        // when twitter loads, copy all of it's attributes to this service
        for (var k in $window.twttr) {
          that[k] = angular.copy($window.twttr[k]);
        }
        // pop off queued sdk invocations
        while (that.$$queue.length > 0) {
          var msg = that.$$queue.shift();
          var method;
          for (var i = 0; i < msg[0].length; i++) {
            method = (method ? method[msg[0][i]] : that[msg[0][i]]);
          }
          method.apply(msg[1]);
        }
      }
    }, 5);
  })
  .service('$gplus', function ($window) {
    if (angular.isUndefined($window.gapi)) {
      (function () {
        var po = document.createElement('script');
        po.type = 'text/javascript';
        po.async = true;
        po.src = 'https://apis.google.com/js/plusone.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(po, s);
      })();
    }
    var that = this;
    this.$$queue = [];
    this.$$enqueue = function () {
      var method = arguments;
      return function () {
        var args = arguments;
        that.$$queue.push([method, args]);
      };
    };
    // stub widgets with method to enqueue requests while
    // the sdk loads
    this.plusone = {
      go: this.$$enqueue('plusone', 'go')
    };
    // poll until twitter sdk loaded
    var poll = $window.setInterval(function () {
      if (angular.isDefined($window.gapi)) {
        clearInterval(poll);
        // when twitter loads, copy all of it's attributes to this service
        for (var k in $window.gapi) {
          that[k] = $window.gapi[k];
        }
        // pop off queued sdk invocations
        while (that.$$queue.length > 0) {
          var msg = that.$$queue.shift();
          var method;
          for (var i = 0; i < msg[0].length; i++) {
            method = (method ? method[msg[0][i]] : that[msg[0][i]]);
          }
          method.apply(msg[1]);
        }
      }
    }, 5);
  })
  .service('$pageTitle', function ($window) {
    this.set = function() {
      var value = arguments.length > 0 ? Array.prototype.slice.call(arguments,0) : arguments[0];
      var parts;
      if ((value === null) || (value === undefined) || (value === false)) {
        // no page title, do nothing
        parts = [ 'Bountysource' ];
      } else if (typeof(value) === 'string') {
        // string page title, append
        parts = [ value ];
      } else {
        // array page title, slice
        parts = value.slice(0);
      }
      $window.document.title = parts.join(' - ');
    };
  });
