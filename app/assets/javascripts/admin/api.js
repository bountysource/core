angular.module('api.bountysource',[]).
  service('$api', function($http, $q, $cookieJar, $rootScope, $location, $window, $sniffer, $log) {
    var $api = this; // hack to store self reference
    this.access_token_cookie_name = window.BS_ENV.cookie_name_access_token + '_admin';

    // set API host based on environment
    $rootScope.api_host = window.BS_ENV.api_host;

    this.params = function() {
      return this;
    };

    // call(url, 'POST', { foo: bar }, optional_callback)
    this.call = function() {
      var args = Array.prototype.slice.call(arguments);
      var url = $rootScope.api_host + args.shift().replace(/^\//,'');
      var method = typeof(args[0]) === 'string' ? args.shift() : 'GET';
      var params = typeof(args[0]) === 'object' ? args.shift() : {};
      var callback = typeof(args[0]) === 'function' ? args.shift() : function(response) { return response.data; };

      // merge in params from method chain
      if (this.$next_request_params) {
        for (var k in this.$next_request_params) {
          params[k] = this.$next_request_params[k];
        }
        this.$next_request_params = null;
      }

      // merge in params
      params = angular.copy(params);
      if ($cookieJar.getJson($api.access_token_cookie_name)) {
        params.access_token = $cookieJar.getJson($api.access_token_cookie_name);
      }
      params.per_page = params.per_page || 250;

      // deferred JSONP call with a promise
      var deferred = $q.defer();
      if ($sniffer.cors) {

        // HACK: the API doesn't return meta/data hash unless you add a callback, so we add it here and strip it later
        params.callback = 'CORS';
        var cors_callback = function(response, status, headers) {
          response = response.replace(/^(\/\*\*\/ )?CORS\(/,'').replace(/\)$/,'');
          var parsed_response = JSON.parse(response);

          if (parsed_response.meta.status === 401) {
            $api.set_current_person();
            $location.path("/admin/login");
          } else {
            // if (parsed_response.meta.pagination) {
            //   $rootScope.$broadcast('paginationLoaded', parsed_response.meta.pagination)
            // }
            deferred.resolve(callback(parsed_response, status, headers));
          }
        };

        var cors_errback = function(response) {
          alert("Server Error: " + url);
        };

        var headers = {};
        headers.Accept = 'application/vnd.bountysource+json; version=0';
        if (method === 'GET') { $http.get(url, { params: params, headers: headers }).success(cors_callback).error(cors_errback); }
        else if (method === 'HEAD') { $http.head(url, { params: params, headers: headers }).success(cors_callback).error(cors_errback); }
        else if (method === 'DELETE') { $http.delete(url, { params: params, headers: headers }).success(cors_callback).error(cors_errback); }
        else if (method === 'POST') { $http.post(url, params, {headers: headers}).success(cors_callback).error(cors_errback); }
        else if (method === 'PUT') { $http.put(url, params, {headers: headers}).success(cors_callback).error(cors_errback); }

      } else {
        params._method = method;
        params.callback = 'JSON_CALLBACK';
        $http.jsonp(url, { params: params }).success(function(response) {
          deferred.resolve(callback(response));
        });
      }
      return deferred.promise;
    };

    // call(url, 'POST', { foo: bar }, optional_callback)
    this.callv1 = function() {
      // parse arguments
      var args = Array.prototype.slice.call(arguments);
      var url = $rootScope.api_host + args.shift().replace(/^\//,'');
      var method = typeof(args[0]) === 'string' ? args.shift() : 'GET';
      var params = typeof(args[0]) === 'object' ? args.shift() : {};
      var callback = typeof(args[0]) === 'function' ? args.shift() : function(response) { return response.data; };

      // merge in params from method chain
      if (this.$next_request_params) {
        for (var k in this.$next_request_params) {
          params[k] = this.$next_request_params[k];
        }
        this.$next_request_params = null;
      }

      // merge in params
      params = angular.copy(params);
      if ($cookieJar.getJson($api.access_token_cookie_name)) {
        params.access_token = $cookieJar.getJson($api.access_token_cookie_name);
      }
      params.per_page = params.per_page || 250;

      // deferred JSONP call with a promise
      var deferred = $q.defer();
      if ($sniffer.cors) {

        // HACK: the API doesn't return meta/data hash unless you add a callback, so we add it here and strip it later
        params.callback = 'CORS';
        var cors_callback = function(response) {
          response = response.replace(/^(\/\*\*\/ )?CORS\(/,'').replace(/\)$/,'');
          var parsed_response = JSON.parse(response);

          if (parsed_response.meta.status === 401) {
            $api.set_current_person();
            $location.path("/admin/login");
          } else {
            // if (parsed_response.meta.pagination) {
            //   $rootScope.$broadcast('paginationLoaded', parsed_response.meta.pagination)
            // }
            deferred.resolve(callback(parsed_response));
          }
        };

        var headers = {};
        headers.Accept = 'application/vnd.bountysource+json; version=1';
        if (method === 'GET') { $http.get(url, { params: params, headers: headers }).success(cors_callback); }
        else if (method === 'HEAD') { $http.head(url, { params: params, headers: headers }).success(cors_callback); }
        else if (method === 'DELETE') { $http.delete(url, { params: params, headers: headers }).success(cors_callback); }
        else if (method === 'POST') { $http.post(url, params, {headers: headers}).success(cors_callback); }
        else if (method === 'PUT') { $http.put(url, params, {headers: headers}).success(cors_callback); }

      } else {
        params._method = method;
        params.callback = 'JSON_CALLBACK';
        $http.jsonp(url, { params: params }).success(function(response) {
          deferred.resolve(callback(response));
        });
      }
      return deferred.promise;
    };

    this.callv2 = function(options) {
      options = options || {};
      options.params = options.params || {};

      options.verbose = false;

      options.headers = options.headers || {};
      options.headers.Accept = options.headers.Accept || 'application/vnd.bountysource+json; version=2';
      options.method = options.method || 'GET';

      var path = (options.url || '').replace(/^\/+/,'');
      options.url = $rootScope.api_host + path;

      // Append access token to params if present.
      // If params already has access_token set, that value takes precedence.
      if ($cookieJar.getJson($api.access_token_cookie_name)) {
        options.params.access_token = $cookieJar.getJson($api.access_token_cookie_name);
      }

      if (options.verbose) {
        $log.info('------ API Request ' + (new Date()).getTime() + ' ------');
        $log.info('Path:', path);
        $log.info('Headers:', options.headers);
        $log.info('Params:', options.params);
        $log.info('----------------------------');
      }

      // same callback used for both success/error
      var callback = function(response) {
        response.success = (response.status >= 200 && response.status < 400);

        if (options.verbose) {
          $log.info('------ API Response ' + (new Date()).getTime() + ' ------');
          $log.info('Status:', response.status);
          $log.info('Data:', response.data);
          $log.info('Headers:', response.headers());
          $log.info('----------------------------');
        }
        return response;
      };

      return $http(options).then(callback, callback);
    };

    // these should probably go in an "AuthenticationController" or something more angular

    this.signin = function(form_data) {
      return this.call("/admin/login", "POST", { email: form_data.email, password: form_data.password, admin_secret: form_data.admin_secret}, function(response) {
        if (response.meta.status === 200) {
          // NOTE: /user/login doesn't return the same as /user... so to be safe we make another api call
          response.data.access_token = response.data.access_token+"."+form_data.admin_secret;
          $api.set_current_person(response.data);
          $api.goto_post_auth_url();
        }
        return response.data;
      });
    };

    this.set_current_person = function(obj) {
      if (obj && obj.error) {
        // don't do anything
      } else if (obj) {
        // FIXME: special case when updating set_current_person with a newer version of the same object but it's missing an access_token
        if (obj && $rootScope.current_person && (obj.id === $rootScope.current_person.id) && !obj.access_token && $rootScope.current_person.access_token) {
          obj.access_token = $rootScope.current_person.access_token;
        }
        $rootScope.current_person = obj;
        $cookieJar.setJson($api.access_token_cookie_name, $rootScope.current_person.access_token);
      } else {
        $rootScope.current_person = false;
        $cookieJar.remove($api.access_token_cookie_name);
      }
    };

    this.set_post_auth_url = function(url, params) {
      $cookieJar.setJson('postauth_url', $api.pathMerge(url, params));
    };

    this.clear_post_auth_url = function() {
      $cookieJar.remove('postauth_url');
    };

    this.goto_post_auth_url = function() {
      var redirect_url = $cookieJar.getJson('postauth_url') || '/admin';
      this.clear_post_auth_url();
      $location.url(redirect_url).replace();
    };

    this.signup = function(form_data) {
      return this.call("/user", "POST", form_data, function(response) {
        if (response.meta.status === 200) {
          $api.set_current_person(response.data);
          $api.goto_post_auth_url();
        }
        return response.data;
      });
    };

    this.check_email_address = function(email) {
      return this.call("/user/login", "POST", { email: email });
    };

    // this.signin_with_access_token = function(access_token) {
    //   return this.call("/user", { access_token: access_token }, function(response) {
    //     if (response.meta.status === 200) {
    //       response.data.access_token = access_token; // FIXME: why doesn't /user include an access token when it's you?
    //       $api.set_current_person(response.data);
    //       $api.goto_post_auth_url();
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   });
    // };

    this.set_access_token = function(new_access_token) {
      return $cookieJar.setJson($api.access_token_cookie_name, new_access_token);
    };

    this.get_access_token = function() {
      return $cookieJar.getJson($api.access_token_cookie_name);
    };

    this.load_current_person_from_cookies = function() {
      var access_token = $cookieJar.getJson($api.access_token_cookie_name);
      if (access_token) {
        $api.set_current_person({ access_token: access_token });
      }
    };

    this.signout = function() {
      $api.set_current_person();
      $location.path("/admin/login");
    };

    // helper functions... definitely doesn't belong here
    this.pathMerge = function(url, params) {
      var new_url = angular.copy(url);
      if (params) {
        new_url += (url.indexOf('?') >= 0 ? '&' : '?') + $api.toKeyValue(params);
      }
      return new_url;
    };

    this.toKeyValue = function(obj) {
      var parts = [];
      angular.forEach(obj, function(value, key) {
        parts.push($api.encodeUriQuery(key, true) + (value === true ? '' : '=' + $api.encodeUriQuery(value, true)));
      });
      return parts.length ? parts.join('&') : '';
    };

    this.signin_url_for = function(provider, options) {
      options = options || {};

      options.redirect_url = window.BS_ENV.www_host + 'signin/callback?provider='+provider;
      if ($cookieJar.getJson($api.access_token_cookie_name)) { options.access_token = $cookieJar.getJson($api.access_token_cookie_name); }
      return window.BS_ENV.api_host + 'auth/' + provider + '?' + $api.toKeyValue(options);
    };

    this.encodeUriQuery = function(val, pctEncodeSpaces) {
      return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
    };

    // save the previous URL for postauth redirect,
    // then request signin
    this.require_signin = function(path, params) {
      if (!$rootScope.current_person) {
        if (path) {
          this.set_post_auth_url(path, params);
        } else {
          var url = $location.path();
          this.set_post_auth_url(url);
        }
        $location.url("/signin");
      }
    };

    ///////////////////// START OF ADMIN SPECIFIC API CALLS \\\\\\\\\\\\\\\\\\\\

    this.get_request_for_proposals = function () {
      return this.call("/admin/request_for_proposals");
    };

    this.get_activity_logs = function () {
      return this.call("/admin/activity_logs");
    };

    this.get_stats = function() {
      return this.call('/admin/stats');
    };

    this.get_searches = function(params) {
      return this.call("/admin/searches", params, function(response) {
        return response;
      });
    };

    this.get_popular_searches = function() {
      return this.call("/admin/searches/popular");
    };

    this.get_people = function(params) {
      return this.call("/admin/people", params, function(response) {
        return response;
      });
    };

    this.get_shorts = function(params) {
      return this.call("/admin/shorts", params, function(response) {
        return response;
      });
    };

    this.create_short = function(params) {
      return this.call("/admin/shorts", 'POST', params, function(response) {
        return response;
      });
    };

    this.get_access_tokens = function(params) {
      return this.call("/admin/people/access_tokens", params, function(response) {
        return response;
      });
    };

    this.get_celebrities = function(params) {
      return this.call("/admin/people/celebrities", params, function(response) {
        return response;
      });
    };

    this.get_person = function(id) {
      return this.call("/admin/people/"+id);
    };

    this.update_person = function (person_id, form_data) {
      return this.call("/admin/people/"+person_id, 'PUT', form_data, function (response) {
        return response;
      });
    };

    this.delete_person = function(id) {
      return this.call("/admin/people/"+id, 'DELETE', function(response) {
        return response;
      });
    };

    this.gift_money = function(person_id, amount) {
      return this.call("/admin/people/"+person_id+"/account/gift", 'POST', { amount: amount });
    };

    this.sync_newsletter = function() {
      return this.call("/admin/people/sync_newsletter", function(response) {
        return response;
      });
    };

    this.get_bounties = function(params) {
      return this.call("/admin/bounties", params, function(response) {
        return response;
      });
    };

    this.get_unacknowledged_bounties = function(params) {
      return this.call("/admin/bounties/unacknowledged", params, function(response) {
        return response;
      });
    };

    this.acknowledge_bounty = function(id) {
      return this.call("/admin/bounties/" + id + "/acknowledge", "POST", function(response) {
        return response;
      });
    };

    this.unacknowledge_bounty = function(id) {
      return this.call("/admin/bounties/" + id + "/unacknowledge", "POST", function(response) {
        return response;
      });
    };

    this.get_bounty = function(id) {
      return this.call("/admin/bounties/"+id, function(response) {
        return response;
      });
    };

    this.update_bounty = function(id, params) {
      return this.call("/admin/bounties/"+id, "PUT", params, function(response) {
        return response;
      });
    };

    this.get_trackers = function(page) {
      return this.call("/admin/trackers", { page: page, per_page: 50}, function(response) {
        return response;
      });
    };

    this.get_tags = function(params) {
      return this.call("/admin/tags", params, function(response) {
        return response;
      });
    };

    this.get_tag = function(id) {
      return this.call("/admin/tags/" + id, function(response) {
        return response;
      });
    };

    this.delete_tag = function(id) {
      return this.call("/admin/tags/" + id, "DELETE", function(response) {
        return response;
      });
    };

    this.get_tracker = function(id) {
      return this.call("/admin/trackers/" + id, function(response) {
        return response;
      });
    };

    this.update_tracker = function(id, data) {
      return this.call("/admin/trackers/" + id, "PUT", data, function(response) {
        return response;
      });
    };

    this.get_issues = function(params) {
      return this.call("/admin/issues", params, function(response) {
        return response;
      });
    };

    this.languages_get = function() {
      return this.call("/languages");
    };

    this.get_closed_issues = function (params) {
      return this.call("/admin/issues/closed", function (response) {
        return response;
      });
    };

    this.get_open_issues = function (params) {
      return this.call("/admin/issues/open", function (response) {
        return response;
      });
    };

    this.get_paid_out_issues = function (params) {
      return this.call("/admin/issues/paid_out", function (response) {
        return response;
      });
    };

    this.issues_stats_count = function (params) {
      return this.call("/admin/issues/counts");
    };

    this.update_issue = function(id, form_data) {
      return this.call("/admin/issues/"+id, 'PUT', form_data, function(response) {
        return response;
      });
    };

    this.get_issue = function(id) {
      return this.call("/admin/issues/"+id, function(response) {
        return response;
      });
    };

    this.refund_bounty = function(id) {
      return this.call("/admin/bounties/"+id+"/refund", 'POST', function(response) {
        return response;
      });
    };

    this.move_bounty = function(issue_id, id) {
      return this.call("/admin/bounties/"+id+"/move?issue_id=" + issue_id, 'POST', function(response) {
        return response;
      });
    };

    this.get_bounty_claims = function(params) {
      return this.call("/admin/bounty_claims", params, function(response) {
        return response;
      });
    };

    this.get_bounty_claim = function(id) {
      return this.call("/admin/bounty_claims/"+id, function(response) {
        return response;
      });
    };

    this.update_claim = function(id, form_data) {
      return this.call("/admin/bounty_claims/"+id, "PUT", form_data, function(response) {
        return response;
      });
    };

    this.get_plugins = function(params) {
      return this.call("/admin/tracker_plugins", params, function(response) {
        return response;
      });
    };

    this.update_tracker_plugin = function(id, data) {
      return this.call("/admin/tracker_plugins/"+id, "PUT", data);
    };

    this.get_follows = function(params) {
      return this.call("/admin/follows", params, function(response) {
        return response;
      });
    };

    this.get_fundraisers = function(params) {
      return this.call("/admin/fundraisers", params, function(response) {
        return response;
      });
    };

    this.get_fundraiser = function(id) {
      return this.call("/admin/fundraisers/"+id, function(response) {
        return response;
      });
    };

    this.update_fundraiser = function(id, data) {
      return this.call("/admin/fundraisers/"+id, 'PUT', data, function(response) {
        return response;
      });
    };

    this.delete_fundraiser = function(id) {
      return this.call("/admin/fundraisers/"+id, 'DELETE', function(response) {
        return response;
      });
    };

    this.get_fundraiser_trackers = function (id) {
      return this.call("/admin/fundraisers/"+id+"/tracker_relations", function (response) {
        return response;
      });
    };

    this.add_fundraiser_tracker = function (fundraiser_id, tracker_id) {
      return this.call("/admin/fundraisers/"+fundraiser_id+"/add_tracker_relation", "POST", {tracker_id: tracker_id}, function (response) {
        return response;
      });
    };

    this.remove_fundraiser_tracker = function (fundraiser_id, tracker_id) {
      return this.call("/admin/fundraisers/"+fundraiser_id+"/remove_tracker_relation", "DELETE", {tracker_id: tracker_id}, function (response) {
        return response;
      });
    };

    this.get_pledges = function(params) {
      return this.call("/admin/pledges", params, function(response) {
        return response;
      });
    };

    this.get_pledge = function(id) {
      return this.call("/admin/pledges/"+id, function(response) {
        return response;
      });
    };

    this.get_transactions = function(params) {
      return this.call("/admin/transactions", params, function(response) {
        return response;
      });
    };

    this.get_unaudited_transactions = function(params) {
      return this.call("/admin/transactions", params, function(response) {
        return response;
      });
    };

    this.get_transaction = function(id) {
      return this.call("/admin/transactions/"+id, function(response) {
        return response;
      });
    };

    this.update_transaction = function(form_data) {
      return this.call("/admin/transactions/"+form_data.id, 'PUT', form_data, function(response) {
        return response;
      });
    };

    this.create_transaction = function(form_data) {
      return this.call("/admin/transactions", 'POST', form_data, function(response) {
        return response;
      });
    };

    this.delete_transaction = function(id) {
      return this.call("/admin/transactions/"+id, "DELETE", function(response) {
        return response;
      });
    };

    this.get_accounts = function() {
      return this.call("/admin/accounts/overview", function(response) {
        return response;
      });
    };

    this.get_account = function(id) {
      return this.call("/admin/accounts/"+id, function(response) {
        return response;
      });
    };

    this.search = function(query) {
      return this.call("/admin/search", "POST", query, function(response) {
        return response;
      });
    };

    this.full_sync = function (id) {
      return this.call("/admin/trackers/"+id+"/full_sync", "POST", function (response) {
        return response;
      });
    };

    this.delayed_jobs_get = function() {
      return this.call("/admin/delayed_jobs");
    };

    this.delayed_job_perform = function(id) {
      return this.call("/admin/delayed_jobs/"+id+"/perform", "POST");
    };

    this.delayed_job_delete = function(id) {
      return this.call("/admin/delayed_jobs/"+id, "DELETE");
    };

    this.get_teams = function (params) {
      return this.call("/admin/teams", params, function (response) {
        return response;
      });
    };

    this.get_takedowns = function() {
      return this.call("/admin/takedowns");
    };

    this.create_takedown = function(form_data) {
      return this.call("/admin/takedowns", "POST", form_data);
    };

    this.get_team = function (id) {
      return this.call("/admin/teams/"+id);
    };

    this.update_team = function (id, form_data) {
      return this.call("/admin/teams/"+id, 'PUT', form_data);
    };

    this.delete_team = function (id) {
      return this.call("/admin/teams/"+id, 'DELETE');
    };

    this.create_team = function (form_data) {
      return this.call("/admin/teams", 'POST', form_data);
    };

    this.delayed_jobs_info = function(params) {
      return this.call("/admin/delayed_jobs/info", "GET", (params || {}));
    };

    this.tracker_merges_get = function() {
      return this.call("/admin/tracker_merges");
    };

    this.tracker_merges_sync = function() {
      return this.call("/admin/tracker_merges/sync", "POST");
    };

    this.tracker_merge_get = function(id) {
      return this.call("/admin/tracker_merges/"+id);
    };

    this.tracker_merge_run = function(id) {
      return this.call("/admin/tracker_merges/"+id+"/run", "POST");
    };

    this.tracker_merge_destroy = function(id) {
      return this.call("/admin/tracker_merges/"+id, "DELETE");
    };

    this.tracker_sync = function(id) {
      return this.call("/admin/trackers/"+id+"/sync", "POST");
    };

    this.bounty_searches_get = function() {
      return this.call("/admin/searches/bounty");
    };

    this.get_developer_goals = function () {
      return this.call("/admin/developer_goals", function (response) {
        return response;
      });
    };

    this.get_solutions = function () {
      return this.call("/admin/solutions", function (response) {
        return response;
      });
    };

    this.transaction_types = function() {
      return [
        'Transaction',
        'Transaction::BankTransfer',
        'Transaction::CashOut::BankOfAmerica',
        'Transaction::CashOut::GoogleWallet',
        'Transaction::CashOut::Paypal',
        'Transaction::CashOut',
        'Transaction::InternalTransfer::BountyClaim',
        'Transaction::InternalTransfer::BountyRefund',
        'Transaction::InternalTransfer::FundraiserCashOut',
        'Transaction::InternalTransfer::Promotional',
        'Transaction::InternalTransfer::RevenueRecognition',
        'Transaction::InternalTransfer',
        'Transaction::Order::GoogleWallet',
        'Transaction::Order::Internal',
        'Transaction::Order::Paypal',
        'Transaction::Order::Coinbase',
        'Transaction::Order',
        'Transaction::Refund::Paypal',
        'Transaction::Refund'
      ];
    };

    this.generic_account_types = function() {
      return [
        'Account::Fundraiser',
        'Account::IssueAccount',
        'Account::Personal',
        'Account::Repository',
        'Account::Team'
      ];
    };

    this.item_types = function() {
      return [
        'Person',
        'Pledge',
        'Bounty',
        'Fundraiser',
        'Issue',
        'PaypalIpn',
        'Solution',
        'BountyClaim',
        'TrackerDonation',
        'Transaction',
        'GoogleWalletItem',
        'Team',
        'CashOut::Paypal',
        'CashOut::Bitcoin',
        'CashOut::Check'
      ];
    };

    this.special_accounts = function() {
      return [
        {"id":284271,"type":"Account::Amazon","name":""},
        {"id":284345,"type":"Account::BofA","name":""},
        {"id":284349,"type":"Account::BountySourceFeesBounty","name":""},
        {"id":1,"type":"Account::BountySourceFeesPayment","name":"BountySource income account"},
        {"id":284351,"type":"Account::BountySourceFeesPledge","name":""},
        {"id":900,"type":"Account::BountySourceAdjustment","name":"BountySource adjustment account"},
        {"id":121697,"type":"Account::BountySourceMerch","name":""},
        {"id":114783,"type":"Account::DoctorsWithoutBorders","name":""},
        {"id":114777,"type":"Account::ElectronicFrontierFoundation","name":""},
        {"id":114779,"type":"Account::FreeSoftwareFoundation","name":""},
        {"id":284365,"type":"Account::GoogleWallet","name":""},
        {"id":3,"type":"Account::Paypal","name":"PayPal equity account"},
        {"id":114781,"type":"Account::SoftwarePublicInterest","name":""},
        {"id":284786,"type":"Account::BountySourceFeesTeam","name":""}
      ];
    };



  })

  .constant('$person', {
    // this returns a promise and is meant to block rotues via "resolve: $person". it redirects to /signin if need be.

    resolver: function($api, $q, $rootScope, $location) {
      var deferred = $q.defer();

      var success = function() {
        deferred.resolve();
      };

      var failure = function() {
        deferred.reject();
        $api.set_post_auth_url($location.url());
        $location.url('/signin').replace();
      };

      if ($rootScope.current_person) {
        // already logged in? go ahead and resolve immediately
        $rootScope.$evalAsync(success);
      } else if ($rootScope.current_person === false) {
        // not logged in? go ahead and fail
        $rootScope.$evalAsync(failure);
      } else {
        // otherwise we're still waiting on load_current_person_from_cookies (likely a fresh page load)
        $rootScope.$watch('current_person', function() {
          if ($rootScope.current_person) {
            success();
          } else if ($rootScope.current_person === false) {
            failure();
          }
        });
      }

      return deferred.promise;
    }
  });
