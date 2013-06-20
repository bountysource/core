'use strict';

angular.module('api.bountysource',[]).
  service('$api', function($http, $q, $cookieStore, $rootScope, $location, $window) {
    $rootScope.api_host = "https://api.bountysource.com/";

    // environment
    $rootScope.environment = $cookieStore.get('environment') || 'prod';
    if ($rootScope.environment === 'dev') {
      $rootScope.api_host = "http://api.bountysource.dev/";
    } else if ($rootScope.environment === 'qa') {
      $rootScope.api_host = "https://api-qa.bountysource.com/";
    }

    this.setEnvironment = function(env) {
      $cookieStore.put('environment', env);
      $window.location.reload();
    };

    // call(url, 'POST', { foo: bar }, optional_callback)
    this.call = function() {
      // parse arguments
      var args = Array.prototype.slice.call(arguments);
      var url = $rootScope.api_host + args.shift().replace(/^\//,'');
      var method = typeof(args[0]) === 'string' ? args.shift() : 'GET';
      var params = typeof(args[0]) === 'object' ? args.shift() : {};
      var callback = typeof(args[0]) === 'function' ? args.shift() : function(response) { return response.data; };

      // merge in params
      params.callback = 'JSON_CALLBACK';
      params._method = method;
      if ($cookieStore.get('access_token')) {
        params.access_token = $cookieStore.get('access_token');
      }

      // deferred JSONP call with a promise
      var deferred = $q.defer();
      $http.jsonp(url, { params: params }).success(function(response) {
        deferred.resolve(callback(response));
      });
      return deferred.promise;
    };

    this.fundraiser_cards = function() {
      return this.call("/fundraisers/cards", function(r) { return r.data.in_progress.concat(r.data.completed); });
    };

    this.fundraiser_get = function(id) {
      return this.call("/user/fundraisers/"+id, function(res) {
        // hacky way to add calculated funding percentage to data.
        // TODO proper Models
        if (res.meta.success) res.data.funding_percentage = Math.min(Math.ceil((res.data.total_pledged / res.data.funding_goal) * 100), 100);

        return res.data;
      });
    };

    this.fundraiser_update = function(id, data) {
      return this.call("/user/fundraisers/"+id, "PUT", data);
    };

    this.fundraiser_create = function(data) {
      return this.call("/user/fundraisers", "POST", data);
    };

    this.fundraiser_pledges_get = function(id) {
      return this.call("/user/fundraisers/"+id+"/pledges");
    };

    this.fundraiser_update_get = function(fundraiser_id, id) {
      return this.call("/user/fundraisers/"+fundraiser_id+"/updates/"+id);
    };

    this.fundraiser_publish = function(id, callback) {
      return this.call("/user/fundraisers/"+id+"/publish", "POST", callback);
    };

    this.reward_create = function(fundraiser_id, data, callback) {
      this.call("/user/fundraisers/"+fundraiser_id+"/rewards", "POST", data, callback);
    };

    this.reward_update = function(fundraiser_id, id, data, callback) {
      this.call("/user/fundraisers/"+fundraiser_id+"/rewards/"+id, "PUT", data, callback);
    };

    this.reward_destroy = function(fundraiser_id, id, callback) {
      this.call("/user/fundraisers/"+fundraiser_id+"/rewards/"+id, "DELETE", callback);
    };

    this.people_recent = function() {
      return this.call("/user/recent");
    };

    this.person_get = function(id) {
      return this.call("/users/"+id);
    };

    this.person_timeline_get = function(id) {
      return this.call("/users/"+id+"/activity");
    };

    this.project_cards = function() {
      return this.call("/trackers/cards", function(r) { return r.data.featured_trackers.concat(r.data.all_trackers); });
    };

    this.tracker_get = function(id) {
      return this.call("/trackers/"+id+"/overview");
    };

    this.issue_get = function(id) {
      return this.call("/issues/"+id);
    };


    // these should probably go in an "AuthenticationController" or something more angular

    this.signin = function(form_data) {
      var that = this;
      return this.call("/user/login", "POST", { email: form_data.email, password: form_data.password, account_link_id: form_data.account_link_id }, function(response) {
        if (response.meta.status === 200) {
          $rootScope.current_person = response.data;
          $cookieStore.put('access_token', $rootScope.current_person.access_token);
          that.after_signin(response);
        }
        return response.data;
      });
    };

    this.signup = function(form_data) {
      var that = this;
      return this.call("/user", "POST", form_data, function(response) {
        if (response.meta.status === 200) {
          $rootScope.current_person = response.data;
          $cookieStore.put('access_token', $rootScope.current_person.access_token);
          that.after_signin(response);
        }
        return response.data;
      });
    };

    this.check_email_address = function(email) {
      return this.call("/user/login", "POST", { email: email });
    };

    this.signin_with_access_token = function(access_token) {
      var that = this;
      return this.call("/user", { access_token: access_token }, function(response) {
        if (response.meta.status === 200) {
          $rootScope.current_person = response.data;
          // TODO: why doesn't /user return an access_token like /user/login ?
          $rootScope.current_person.access_token = access_token;
          $cookieStore.put('access_token', $rootScope.current_person.access_token);
          that.after_signin(response);
          return true;
        } else {
          return false;
        }
      });
    };

    this.after_signin = function(response) {
      $location.url($cookieStore.get('postauth_url') || '/').replace();
      $cookieStore.remove('postauth_url');
    };

    this.verify_access_token = function() {
      var access_token = $cookieStore.get('access_token');
      if (access_token) {
        console.log("Verifying access token: " + access_token);
        var that = this;
        this.call("/user", { access_token: access_token }, function(response) {
          if (response.meta.status === 200) {
            console.log("access token still valid");
            $rootScope.current_person = response.data;
          } else {
            console.log("access token expired. signing out.");
            that.signout();
          }
        });
      }
    };

    this.signin_url_for = function(provider) {
      // todo, include redirect_url in callback
      return $rootScope.api_host.replace(/\/$/,'') + '/auth/' + provider + '?redirect_url=' + encodeURIComponent('http://localhost:9000/signin/callback?provider='+provider);
    };

    this.signout = function() {
      $rootScope.current_person = null;
      $cookieStore.remove('access_token');
      $location.path("/");
    };

    this.process_payment = function(current_scope, data) {
      return this.call("/payments", "POST", data, function(response) {
        if (response.meta.success) {
          if (data.payment_method == 'google') {
            // a JWT is returned, trigger buy
            $window.google.payments.inapp.buy({
              jwt: response.data.jwt,
              success: function(result) {
                console.log('Google Wallet: Great Success!', result);
                $window.location = $rootScope.api_host + "payments/google/success?access_token="+$cookieStore.get('access_token')+"&order_id="+result.response.orderId;
              },
              failure: function(result) {
                console.log('Google Wallet: Error', result);
              }
            });
          } else if (data.payment_method == 'personal') {

            console.log('TODO Update personal account balance');

          } else {
            $window.location = response.data.redirect_url;
          }
        } else if (response.meta.status == 401) {
          $cookieStore.put('postauth_url', data.postauth_url);
          $location.path('/signin');
        } else {
          current_scope.payment_error = response.data.error;
        }
      });
    };

  });
