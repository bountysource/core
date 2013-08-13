'use strict';

angular.module('api.bountysource',[]).
  service('$api', function($http, $q, $cookieStore, $rootScope, $location, $window, $sniffer) {
    var $api = this; // hack to store self reference
    this.access_token_cookie_name = 'v2_access_token';

    // set environment
    $rootScope.environment = window.BS_ENV;
    if ($location.host().match(/localhost/)) {
      $rootScope.can_switch_environments = true;
      $rootScope.environment = $cookieStore.get('environment') || $rootScope.environment;
    }


    // set API host based on environment
    if ($rootScope.environment === 'dev') {
      $rootScope.api_host = "http://api.bountysource.dev/";
    } else if ($rootScope.environment === 'qa') {
      $rootScope.api_host = "https://api-qa.bountysource.com/";
    } else if ($rootScope.environment === 'prod') {
      $rootScope.api_host = "https://api.bountysource.com/";
    }

    this.setEnvironment = function(env) {
      $cookieStore.put('environment', env);
      $window.location.reload();
    };

    //set flag for test environment. see call() to view implementation. hardcoded--revisit later.
    if (window.location.host === "localhost:8081") {
      $rootScope.__test__ = true;
    }

    this.$shift_mock_response = function() {
      var count = parseInt(window.localStorage.getItem('stubsCount'), 10);
      if (count > 0) {
        // decrement count
        window.localStorage.setItem('stubsCount', count - 1);

        return JSON.parse(localStorage.getItem('response'+count));
      } else {
        throw("Nothing left :/");
      }
    };
    // call(url, 'POST', { foo: bar }, optional_callback)
    this.call = function() {
      //if we are in the test environment, call the mocked $api.call() otherwise, use the prod call()
      if ($rootScope.__test__) {
        var mockArgs = Array.prototype.slice.call(arguments);
        var request = {
          path: mockArgs.shift(),
          method: typeof(mockArgs[0]) === 'string' ? mockArgs.shift() : 'GET',
          params: typeof(mockArgs[0]) === 'object' ? mockArgs.shift() : {},
          callback: typeof(mockArgs[0]) === 'function' ? mockArgs.shift() : function(response) { return response.data;}
        };

        console.log("Request", JSON.stringify(request));
        console.log("PARAMS", JSON.stringify(request.params));
        var mock_response = this.$shift_mock_response();

        console.log("Mock response:", mock_response);
        // request.callback(mock_response);

        var mockDeferred = $q.defer();
        mockDeferred.resolve(request.callback(mock_response));
        return mockDeferred.promise;

      } else {

      // parse arguments
        var args = Array.prototype.slice.call(arguments);
        var url = $rootScope.api_host + args.shift().replace(/^\//,'');
        var method = typeof(args[0]) === 'string' ? args.shift() : 'GET';
        var params = typeof(args[0]) === 'object' ? args.shift() : {};
        var callback = typeof(args[0]) === 'function' ? args.shift() : function(response) { return response.data; };

        // merge in params
        params = angular.copy(params);
        if ($cookieStore.get($api.access_token_cookie_name)) {
          params.access_token = $cookieStore.get($api.access_token_cookie_name);
        }
        params.per_page = params.per_page || 250;

        // deferred JSONP call with a promise
        var deferred = $q.defer();
        if ($sniffer.cors) {

          // HACK: the API doesn't return meta/data hash unless you add a callback, so we add it here and strip it later
          params.callback = 'CORS';
          var cors_callback = function(response) {
            response = response.replace(/^CORS\(/,'').replace(/\)$/,'');
            deferred.resolve(callback(JSON.parse(response)));
          };
          // make actual HTTP call with promise
          if (method === 'GET') { $http.get(url, { params: params }).success(cors_callback); }
          else if (method === 'HEAD') { $http.head(url, { params: params }).success(cors_callback); }
          else if (method === 'DELETE') { $http.delete(url, { params: params }).success(cors_callback); }
          else if (method === 'POST') { $http.post(url, params, {}).success(cors_callback); }
          else if (method === 'PUT') { $http.put(url, params, {}).success(cors_callback); }

        } else {
          params._method = method;
          params.callback = 'JSON_CALLBACK';
          $http.jsonp(url, { params: params }).success(function(response) {
            deferred.resolve(callback(response));
          });
        }
        return deferred.promise;
      }
    };

    this.fundraiser_cards = function() {
      return this.call("/fundraisers/cards", function(r) { return r.data.in_progress.concat(r.data.completed); });
    };

    this.fundraiser_get = function(id) {
      return this.call("/user/fundraisers/"+id, function(res) {
        // hacky way to add calculated funding percentage to data.
        // TODO proper Models
        if (res.meta.success) {
          res.data.funding_percentage = Math.ceil((res.data.total_pledged / res.data.funding_goal) * 100);
          res.data.can_manage = $rootScope.current_person && ($rootScope.current_person.admin || res.data.person.id === $rootScope.current_person.id);
          res.data.image_url = res.data.image_url || "/images/bountysource-grey.png";

          // calculate time left
          // using Moment.js
          var now = new Moment();
          var ends = new Moment(res.data.ends_at);
          res.data.$days_left = ends.diff(now, "days");
          res.data.$hours_left = ends.diff(now, "hours");
          res.data.$minutes_left = ends.diff(now, "minutes");
        }
        return res.data;
      });
    };

    this.fundraiser_info_get = function(id) {
      return this.call("/user/fundraisers/"+id+"/info", function(res) {
        if (res.meta.success) {
          res.data.funding_percentage = Math.ceil((res.data.total_pledged / res.data.funding_goal) * 100);
          res.data.can_manage = $rootScope.current_person && ($rootScope.current_person.admin || res.data.person.id === $rootScope.current_person.id);
        }
        return res.data;
      });
    };

    this.fundraiser_update = function(id, data) {
      return this.call("/user/fundraisers/"+id, "PUT", data);
    };

    this.fundraiser_create = function(data, callback) {
      return this.call("/user/fundraisers", "POST", data, callback);
    };

    this.fundraiser_pledges_get = function(id) {
      return this.call("/user/fundraisers/"+id+"/pledges");
    };

    this.fundraiser_publish = function(id, callback) {
      return this.call("/user/fundraisers/"+id+"/publish", "POST", callback);
    };

    this.fundraiser_update_get = function(fundraiser_id, id, callback) {
      return this.call("/user/fundraisers/"+fundraiser_id+"/updates/"+id, callback);
    };

    this.fundraiser_update_create = function(fundraiser_id, data, callback) {
      return this.call("/user/fundraisers/"+fundraiser_id+"/updates", "POST", data, callback);
    };

    this.fundraiser_update_edit = function(fundraiser_id, id, data, callback) {
      return this.call("/user/fundraisers/"+fundraiser_id+"/updates/"+id, "PUT", data, callback);
    };

    this.fundraiser_update_destroy = function(fundraiser_id, id, callback) {
      return this.call("/user/fundraisers/"+fundraiser_id+"/updates/"+id, "DELETE", callback);
    };

    this.fundraiser_update_publish = function(fundraiser_id, id, callback) {
      return this.call("/user/fundraisers/"+fundraiser_id+"/updates/"+id+"/publish", "POST", callback);
    };

    this.fundraisers_get = function() {
      return this.call("/fundraisers");
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

    this.people_interesting = function() {
      return this.call("/user/interesting");
    };

    this.person_get = function(id) {
      return this.call("/users/"+id);
    };

    this.person_put = function(data) {
      var promise = this.call("/user", "PUT", data);
      promise.then($api.set_current_person);
      return promise;
    };

    this.change_password = function(data) {
      return this.call("/user/change_password", "POST", data);
    };

    this.reset_password = function(data) {
      return this.call("/user/reset_password", "POST", data);
    };

    this.request_password_reset = function(data) {
      return this.call("/user/request_password_reset", "POST", data);
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

    this.tracker_follow = function(id) {
      return this.call("/follows", "PUT", { item_id: id, item_type: "tracker" });
    };

    this.tracker_unfollow = function(id) {
      return this.call("/follows", "DELETE", { item_id: id, item_type: "tracker" });
    };

    this.tracker_issues_get = function(id) {
      return this.call("/projects/"+id+"/issues");
    };

    this.issue_get = function(id, callback) {
      return this.call("/issues/"+id, callback);
    };

    this.issue_create = function(data, callback) {
      return this.call("/issues", "POST", data, callback);
    };

    this.bounty_activity = function() {
      return this.call('/user/bounties');
    };

    this.pledge_activity = function() {
      return this.call('/user/contributions', function(response) { return response.data.pledges; });
    };

    this.pledge_update = function(id, data) {
      return this.call("/user/pledges/"+id, "PUT", data);
    };

    this.fundraiser_activity = function() {
      return this.call('/user/fundraisers');
    };

    this.solution_activity = function() {
      return this.call('/user/solutions');
    };

    this.transaction_activity = function() {
      return this.call('/user/transactions');
    };

    this.solution_create = function(issue_id, callback) {
      return this.call("/issues/"+issue_id+"/solutions", "POST", callback);
    };

    this.solution_destroy = function(id, callback) {
      return this.call("/user/solutions/"+id, "DELETE", callback);
    };

    this.solution_update = function(id, data, callback) {
      return this.call("/user/solutions/"+id, "PUT", data, callback);
    };

    this.solution_submit = function(id, callback) {
      return this.call("/user/solutions/"+id+"/submit", "POST", callback);
    };

    this.solution_payout = function(id, form_data, callback) {
      return this.call("/user/solutions/"+id+"/payout", "POST", form_data, callback);
    };

    this.dispute_create = function(issue_id, solution_id, data, callback) {
      // BountySource.api('/issues/' + solution.issue.id + '/solutions/' + solution.id + '/disputes', 'POST', form_data, function(response) {
      return this.call("/issues/"+issue_id+"/solutions/"+solution_id+"/disputes", "POST", data, callback);
    };

    this.disputes_get = function(issue_id, solution_id, callback) {
      return this.call("/issues/"+issue_id+"/solutions/"+solution_id+"/disputes", callback);
    };

    this.dispute_resolve = function(issue_id, solution_id, dispute_number, callback) {
      return this.call("/issues/"+issue_id+"/solutions/"+solution_id+"/disputes/"+dispute_number+"/close", "POST", callback);
    };

    this.search = function(query) {
      return this.call("/search", "POST", { query: query });
    };

    this.tracker_relations_get = function() {
      return this.call("/project_relations");
    };

    this.tracker_plugin_create = function(tracker_id, linked_account_id) {
      return this.call("/trackers/"+tracker_id+"/tracker_plugin", "POST", { linked_account_id: linked_account_id });
    };

    this.tracker_plugin_update = function(tracker_id, data) {
      return this.call("/trackers/"+tracker_id+"/tracker_plugin", "PUT", data);
    };

    this.approve_connect = function(provider, data) {
      return this.call("/auth/"+provider+"/approve_connect", "POST", data);
    };

    this.pledge_anonymity_toggle = function(pledge) {
      return this.call("/user/pledges/"+pledge.id, "PUT", { anonymous: (pledge.anonymous ? 0 : 1) });
    };

    this.bounty_anonymity_toggle = function(bounty) {
      return this.call("/user/bounties/"+bounty.id, "PUT", { anonymous: (bounty.anonymous ? 0 : 1) });
    };

    this.tracker_tags_upvote = function(tracker_id, name) {
      return this.call("/trackers/"+tracker_id+"/tags", "PUT", { name: name });
    };

    this.tracker_tags_downvote = function(tracker_id, name) {
      return this.call("/trackers/"+tracker_id+"/tags", "DELETE", { name: name });
    };

    this.tracker_tags_create = function(tracker_id, name) {
      return this.call("/trackers/"+tracker_id+"/tags", "POST", { name: name });
    };

    this.company_create = function(form_data) {
      return this.call("/companies", "POST", form_data);
    };

    this.company_get = function(id) {
      return this.call("/companies/"+id);
    };

    this.company_update = function(id, form_data) {
      return this.call("/companies/"+id, "PUT", form_data);
    };

    this.company_tracker_add = function(id, tracker_id) {
      return this.call("/companies/"+id+"/add_tracker", "PUT", { tracker_id: tracker_id });
    };

    this.company_tracker_remove = function(id, tracker_id) {
      return this.call("/companies/"+id+"/remove_tracker", "DELETE", { tracker_id: tracker_id });
    };

    this.list_companies = function() {
      return this.call("/companies", "GET");
    };

    this.tracker_typeahead = function(query) {
      if (query && (query.length >= 2)) {
        return this.call("/search/typeahead", "GET", { query: query, type: 'tracker' });
      } else {
        return { then: function() { return []; } };
      }
    };


    // these should probably go in an "AuthenticationController" or something more angular

    this.signin = function(form_data) {
      return this.call("/user/login", "POST", { email: form_data.email, password: form_data.password, account_link_id: form_data.account_link_id }, function(response) {
        if (response.meta.status === 200) {
          // NOTE: /user/login doesn't return the same as /user... so to be safe we make another api call
          $api.signin_with_access_token(response.data.access_token);
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
        $cookieStore.put($api.access_token_cookie_name, $rootScope.current_person.access_token);
      } else {
        $rootScope.current_person = false;
        $cookieStore.remove($api.access_token_cookie_name);
      }
    };

    this.set_post_auth_url = function(url, params) {
      $cookieStore.put('postauth_url', $api.pathMerge(url, params));
    };

    this.clear_post_auth_url = function() {
      $cookieStore.remove('postauth_url');
    };

    this.goto_post_auth_url = function() {
      var redirect_url = $cookieStore.get('postauth_url') || '/';
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

    this.signin_with_access_token = function(access_token) {
      return this.call("/user", { access_token: access_token }, function(response) {
        if (response.meta.status === 200) {
          response.data.access_token = access_token; // FIXME: why doesn't /user include an access token when it's you?
          $api.set_current_person(response.data);
          $api.goto_post_auth_url();
          return true;
        } else {
          return false;
        }
      });
    };

    this.set_access_token = function(new_access_token) {
      return $cookieStore.put(this.access_token_cookie_name, new_access_token);
    };

    this.get_access_token = function() {
      return $cookieStore.get(this.access_token_cookie_name);
    };

    this.load_current_person_from_cookies = function() {
      var access_token = $cookieStore.get($api.access_token_cookie_name);
      if (access_token) {
        console.log("Verifying access token: " + access_token);
        this.call("/user", { access_token: access_token }, function(response) {
          if (response.meta.status === 200) {
            console.log("access token still valid");
            response.data.access_token = access_token; // FIXME: why doesn't /user include an access token when it's you?
            $api.set_current_person(response.data);
          } else {
            console.log("access token expired. signing out.");
            $api.set_current_person();
          }
        });
      } else {
        $api.set_current_person();
      }
    };

    this.signout = function() {
      $api.set_current_person();
      $window.location.reload();
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

      // TODO: why isn't this provided by angular.js somewhere?? seems silly that we need to rebuild baseHref
      var DEFAULT_PORTS = {'http': 80, 'https': 443, 'ftp': 21};
      var protocol = $location.protocol();
      var host = $location.host();
      var port = $location.port();

      options.redirect_url = protocol + '://' + host + (port === DEFAULT_PORTS[protocol] ? '' : ':'+port ) + '/signin/callback?provider='+provider;
      if ($cookieStore.get($api.access_token_cookie_name)) { options.access_token = $cookieStore.get($api.access_token_cookie_name); }
      return $rootScope.api_host.replace(/\/$/,'') + '/auth/' + provider + '?' + $api.toKeyValue(options);
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
