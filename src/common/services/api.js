'use strict';

angular.module('services').service('$api', function($http, $q, $cookieStore, $rootScope, $location, $window, $sniffer, $filter, $log, $analytics) {
  var $api = this; // hack to store self reference
  this.access_token_cookie_name = 'v2_access_token';

  // set api_host based on environment
  if ($window.BS_CONFIG.environment === 'development') {
    $rootScope.api_endpoint = $cookieStore.get('api_environment') || 'staging';

    if ($rootScope.api_endpoint === 'development') {
      $rootScope.api_host = "http://localhost:5000/";
    } else if ($rootScope.api_endpoint === 'staging') {
      $rootScope.api_host = "https://staging-api.bountysource.com/";
    } else if ($rootScope.api_endpoint === 'production') {
      $rootScope.api_host = "https://api.bountysource.com/";
    }
  } else {
    $rootScope.api_host = $window.BS_CONFIG.api_host;
  }


  this.$$maxPerPage = 250;
  this.$$perPage = undefined;

  this.perPage = function(value) {
    if (value < 0) { value = 0; }
    if (value > this.$$maxPerPage) { value = this.$$maxPerPage; }
    this.$$perPage = value;
    return this;
  };

  this.page = function (value) {
    if (value < 0) { value = 0; }
    this.$$page = value;
    return this;
  };

  // temporary housing for V2 api routes
  this.v2 = {

    call: function(options) {
      options = options || {};

      options.verbose = false;

      options.headers = options.headers || {};
      options.headers.Accept = options.headers.Accept || 'application/vnd.bountysource+json; version=2';
      options.method = options.method || 'GET';

      var path = (options.url || '').replace(/^\/+/,'');
      options.url = $rootScope.api_host + path;

      // Append access token to params if present.
      // If params already has access_token set, that value takes precedence.
      if ($rootScope.current_person !== false) {
        options.params.access_token = options.params.access_token || $api.get_access_token();
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
    },

    issues: function(params) {
      return this.call({
        url: '/issues',
        params: params || {}
      });
    },

    team: function(slug, params) {
      return this.call({
        url: '/teams/'+slug,
        params: params || {}
      });
    },

    teams: function(params) {
      return this.call({
        url: '/teams',
        params: params || {}
      });
    },

    comments: function (params) {
      return this.call({
        url: '/comments',
        params: params || {}
      });
    },

    issue: function(id, options) {},

    trackers: function (params) {
      return this.call({
        url: '/trackers',
        params: params || {}
      });
    },

    fundraiserUpdates: function(params) {
      return this.call({
        url: '/fundraiser_updates',
        params: params || {}
      });
    },

    fundraiserUpdate: function(id, params) {
      return this.call({
        url: '/fundraiser_updates/' + id,
        params: params || {}
      });
    },

    createFundraiserUpdate: function(fundraiser_id, params) {
      params = angular.extend({ fundraiser_id: fundraiser_id }, params || {});

      return this.call({
        url: '/fundraiser_updates',
        method: 'POST',
        params: params
      });
    },

    pledges: function(params) {
      return this.call({
        url: '/pledges',
        params: params || {}
      });
    },

    fundraiserRewards: function(fundraiser_id, params) {
      params = angular.extend({ fundraiser_id: fundraiser_id }, params || {});

      return this.call({
        url: '/fundraiser_rewards',
        params: params
      });
    },

    backers: function(params) {
      return this.call({
        url: '/backers',
        params: params || {}
      });
    },

    fundraisers: function(params) {
      return this.call({
        url: '/fundraisers',
        params: params || {}
      });
    },

    peopleTrackers: function(params) {
      return this.call({
        url: '/people/trackers',
        params: params || {}
      });
    },

    people: function(params) {
      return this.call({
        url: '/people',
        params: params || {}
      });
    },

    events: function(params) {
      return this.call({
        url: '/events',
        params: params || {}
      });
    },

    event: function(slug, params) {
      return this.call({
        url: '/events/'+slug,
        params: params || {}
      });
    },

    createEvent: function(params) {
      return this.call({
        url: '/events',
        method: 'POST',
        params: params || {}
      });
    },

    updateEvent: function(slug, params) {
      return this.call({
        url: '/events/'+slug,
        method: 'PUT',
        params: params || {}
      });
    },

    addresses: function(params) {
      return this.call({
        url: '/addresses',
        params: params || {}
      });
    },

    address: function(id, params) {
      return this.call({
        url: '/addresses/'+id,
        params: params || {}
      });
    },

    createAddress: function(params) {
      return this.call({
        url: '/addresses',
        method: 'POST',
        params: params || {}
      });
    },

    updateAddress: function(id, params) {
      return this.call({
        url: '/addresses/'+id,
        method: 'PATCH',
        params: params || {}
      });
    },

    deleteAddress: function(id, params) {
      return this.call({
        url: '/addresses/'+id,
        method: 'DELETE',
        params: params || {}
      });
    },

    cashOuts: function(params) {
      return this.call({
        url: '/cash_outs',
        params: params || {}
      });
    },

    createCashOut: function(params) {
      return this.call({
        url: '/cash_outs',
        method: 'POST',
        params: params || {}
      });
    },

    account: function(params) {
      return this.call({
        url: '/account',
        params: params || {}
      });
    }

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
    params = angular.copy(params);
    if ($api.get_access_token()) {
      params.access_token = $api.get_access_token();
    }

    // Pull off perPage if it was set. Otherwise... default everything to 250 because we are lazy right now.
    // Query string parameter takes precedence over this value
    if (this.$$perPage) {
      params.per_page = this.$$perPage;
    } else {
      params.per_page = params.per_page || 250;
    }

    if (this.$$page) {
      params.page = this.$$page;
    } else {
      params.page = params.page || 1;
    }

    // Reset temporary perPage holder
    this.$$perPage = undefined;

    // deferred JSONP call with a promise
    var deferred = $q.defer();
    if ($sniffer.cors) {

      // HACK: the API doesn't return meta/data hash unless you add a callback, so we add it here and strip it later
      params.callback = 'CORS';
      var cors_callback = function(response) {
        response = response.replace(/^CORS\(/,'').replace(/\)$/,'');

        var parsed_response = JSON.parse(response);

        if (parsed_response.meta) {
          // Handle 500 server errors, log request and response data
          if (parsed_response.meta.status === 500) {
            // obfuscate sensitive data
            var logged_params = angular.copy(params);
            if (logged_params.access_token) { logged_params.access_token = "..."; }
            if (logged_params.password) { logged_params.password = "..."; }
            if (logged_params.oauth_token) { logged_params.oauth_token = "..."; }

            $log.warn("API Error");
            $log.info(" * Request", method, url);
            $log.info(" * Request Params", logged_params);
            $log.info(" * Response:", angular.copy(parsed_response));
          } else if (parsed_response.meta.status === 302) {
            $log.info("Redirecting to ", parsed_response.data.url);
            $window.location = parsed_response.data.url;
          }
        }

        deferred.resolve(callback(parsed_response));
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
  };

  this.fundraiser_cards = function() {
    return this.call("/fundraisers/cards", function(r) { return r.data.in_progress.concat(r.data.completed); });
  };

  this.fundraiser_get = function(id) {
    return this.call("/user/fundraisers/"+id, function(res) {
      // hacky way to add calculated funding percentage to data.
      // TODO proper Models
      if (res.meta.success) {
        res.data.funding_percentage = Math.round((res.data.total_pledged / res.data.funding_goal) * 100);
        res.data.can_manage = $rootScope.current_person && ($rootScope.current_person.admin || res.data.person.id === $rootScope.current_person.id);
        res.data.image_url = res.data.image_url || "images/bountysource-grey.png";

        // calculate time left
        var now = new Date().getTime();
        var ends = Date.parse(res.data.ends_at);
        var diff = ends - now;
        res.data.$days_left = Math.floor(diff / (1000*60*60*24));
        res.data.$hours_left = Math.floor(diff / (1000*60*60));
        res.data.$minutes_left = Math.floor(diff / (1000*60));
        res.data.$seconds_left = Math.round(diff / (1000));
      }
      return res.data;
    });
  };

  this.fundraiser_reward_info_get = function(id) {
    return this.call("/user/fundraisers/"+id+"/info", function(res) {
      if (res.meta.success) {
        res.data.funding_percentage = Math.round((res.data.total_pledged / res.data.funding_goal) * 100);
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
    return this.call("/user/fundraisers/"+id+"/pledges").then(function(pledges) {
      for (var i=0; i<pledges.length; i++) {
        // TODO actually use owner, not this person legacy hack
        pledges[i].person = pledges[i].owner;
      }

      return pledges;
    });
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

  this.people_count = function() {
    return this.call("/people/count");
  };

  this.person_get = function(id) {
    return this.call("/users/"+id);
  };

  this.person_update = function(data) {
    return this.call("/user", "PUT", data);
  };

  this.notification_unsubscribe = function(type, data) {
    data.type = type;
    return this.call("/notifications/unsubscribe", 'POST', data, function(response) {
      return response.meta.success;
    });
  };

  this.cancel_all_notifications = function (email) {
    return this.call("/notifications/cancel_all", 'POST', { email: email }, function (response) {
      return response.meta.success;
    });
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

  this.person_activity = function(id) {
    return this.call("/people/"+id+"/activity").then(function(activity) {
      var timeline = [], i;

      for (i in activity.bounties) { timeline.push(activity.bounties[i]); }
      for (i in activity.pledges) { timeline.push(activity.pledges[i]); }
      for (i in activity.fundraisers) { timeline.push(activity.fundraisers[i]); }
      for (i in activity.teams) { timeline.push(activity.teams[i]); }
      for (i in activity.bounty_claim_events) {timeline.push(activity.bounty_claim_events[i]); }

      // add sort date since the col is either added_at (teams) or created_at (everything else)
      for (i in timeline) {
        timeline[i].sort_date = timeline[i].added_at || timeline[i].created_at;
      }
      return timeline;
    });
  };

  this.project_cards = function() {
    return this.call("/trackers/cards", function(r) { return r.data.featured_trackers.concat(r.data.all_trackers); });
  };

  this.tracker_get = function(id) {
    return this.call("/trackers/"+id);
  };

  this.update_tracker = function (id, data) {
    return this.call("/trackers/"+id+"/update", "POST", data, function (response) {
      return response;
    });
  };

  this.trackers_get_bulk = function(ids) {
    return this.call("/bulk/trackers", "GET", {ids: ids});
  };

  this.tracker_follow = function(id) {
    return this.call("/follows", "PUT", { item_id: id, item_type: "Tracker" });
  };

  this.tracker_unfollow = function(id) {
    return this.call("/follows", "DELETE", { item_id: id, item_type: "Tracker" });
  };

  this.tracker_issues_get = function(id) {
    return this.call("/projects/"+id+"/issues");
  };

  this.issues_featured = function() {
    return this.call("/issues/featured");
  };

  this.tracker_stats = function(id) {
    return this.call("/stats/trackers/"+id);
  };

  this.tracker_top_backers = function (id, options) {
    return this.call("/trackers/"+id+"/top_backers", function (response) {
      return response;
    });
  };

  this.issue_get = function(id, callback) {
    return this.call("/issues/"+id, callback).then(function(issue) {
      issue.my_bounty_claim = undefined;
      issue.winning_bounty_claim = undefined;

      for (var i=0; i<issue.bounty_claims.length; i++) {
        // find your claim
        if ($rootScope.current_person && issue.bounty_claims[i].person.id === $rootScope.current_person.id) {
          issue.my_bounty_claim = issue.bounty_claims[i];
        }

        // find the winning bounty claim
        if (!issue.winning_bounty_claim && issue.bounty_claims[i].collected) {
          issue.winning_bounty_claim = issue.bounty_claims[i];
        }
      }

      for (i=0; i<issue.bounties.length; i++) {
        // TODO legacy hack, turn owner into person
        issue.bounties[i].person = issue.bounties[i].owner;
        issue.bounties[i].amount = parseInt(issue.bounties[i].amount, 10);
      }

      //START enforce list of unique backers (prevent repeat backers)
      var unique_backer_bounties = {};
      for (i=0; i<issue.bounties.length; i++) {
        var bounty = issue.bounties[i];
        if (bounty.owner) {
          var backer_id = bounty.owner.id + bounty.owner.type; // adding id+type prevents collision between multiple owner types
          if (unique_backer_bounties[backer_id]) { // backer already exists, add amounts
            var previous_bounty_amount = unique_backer_bounties[backer_id].amount;
            var bounty_amount = parseInt(bounty.amount, 10);
            var new_amount = previous_bounty_amount + bounty_amount;
            unique_backer_bounties[backer_id].amount = new_amount;
          } else {
            unique_backer_bounties[backer_id] = bounty;
            unique_backer_bounties[backer_id].amount = parseInt(bounty.amount, 10);
          }
        } else {
          unique_backer_bounties["anon_"+i] = bounty; //anonymous backer, add to list
          unique_backer_bounties["anon_"+i].amount = parseInt(bounty.amount, 10);
        }
      }
      //cast back into array
      var unique_backer_bounties_arr = [];
      for (var key in unique_backer_bounties) {
        unique_backer_bounties_arr.push(unique_backer_bounties[key]);
      }
      //override original bounties list with new uniqueified list
      issue.bounties = unique_backer_bounties_arr;
      //END list of unique backers

      return issue;
    });
  };

  this.issue_create = function(data, callback) {
    return this.call("/issues", "POST", data, callback);
  };

  this.bounty_activity = function() {
    return this.call('/user/bounties');
  };

  this.user_issue_bounty_total = function(issue_id) {
    return this.call('/user/issues/'+issue_id+'/bounty_total');
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

  this.bounty_claims_activity = function() {
    return this.call('/bounty_claims');
  };

  this.transaction_activity = function() {
    return this.call('/transactions');
  };

  this.search = function(query) {
    return this.call("/search", "POST", { query: query });
  };

  this.bounty_search = function(query) {
    //query will come from the frontend as a JSON object
    return this.call("/search/bounty_search", "GET", query);
  };

  this.saved_search_tabs = function() {
    return this.call("/tabs");
  };

  this.languages_get = function() {
    return this.call("/languages");
  };

  this.my_languages_get = function() {
    return this.call('/my_languages');
  };

  this.my_languages_set = function(language_ids) {
    if (!angular.isArray(language_ids)) {
      language_ids = [language_ids];
    }
    return this.call('/my_languages', 'POST', { language_ids: language_ids.join(',') });
  };

  this.followed_trackers = function() {
    return this.call('/trackers/followed');
  };

  this.tracker_relations_get = function() {
    return this.call("/project_relations");
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

  this.team_create = function(form_data) {
    return this.call("/teams", "POST", form_data);
  };

  this.list_teams = function() {
    return this.call("/teams", "GET");
  };

  this.featured_teams = function() {
    return this.call("/teams", "GET", { filter: 'featured' });
  };

  this.team_get = function(id) {
    return this.call("/teams/"+id);
  };

  this.team_update = function(id, form_data) {
    return this.call("/teams/"+id, "PUT", form_data);
  };

  this.team_issues = function(search_parameters) {
    return this.call("/doge_issues", "GET", search_parameters, function (response) {
      return response;
    });
  };

  this.team_tracker_add = function(id, tracker_id) {
    return this.call("/teams/"+id+"/trackers/"+tracker_id, "POST");
  };

  this.team_tracker_remove = function(id, tracker_id) {
    return this.call("/teams/"+id+"/trackers/"+tracker_id, "DELETE");
  };

  this.team_members_get = function(id) {
    return this.call("/teams/"+id+"/members");
  };

  this.team_member_add = function(team_id, data) {
    return this.call("/teams/"+team_id+"/members", "POST", data);
  };

  this.team_member_remove = function(team_id, member_id) {
    return this.call("/teams/"+team_id+"/members/"+member_id, "DELETE");
  };

  this.team_member_update = function(team_id, member_id, data) {
    return this.call("/teams/"+team_id+"/members/"+member_id, "PUT", data);
  };

  this.team_activity = function(team_id) {
    return this.call("/teams/"+team_id+"/activity");
  };

  this.team_bounties = function(team_id) {
    return this.call("/teams/"+team_id+"/bounties");
  };

  this.team_invite_accept = function(team_id, token) {
    return this.call("/teams/"+team_id+"/invites", "PUT", { token: token });
  };

  this.team_invite_reject = function(team_id, token) {
    return this.call("/teams/"+team_id+"/invites", "DELETE", { token: token });
  };

  this.team_invite_create = function(team_id, data) {
    return this.call("/teams/"+team_id+"/invites", "POST", data, function (response) {
      return response;
    });
  };

  this.team_invites_get = function(team_id) {
    return this.call("/teams/"+team_id+"/invites", "GET");
  };

  this.person_teams_get = function(id) {
    return this.call("/people/" + id + "/teams");
  };

  this.email_registered = function(email) {
    return this.call("/email_registered", "GET", { email: email });
  };

  this.tracker_typeahead = function(query) {
    if (query && (query.length >= 2)) {
      return this.call("/search/typeahead", "GET", { query: query, type: 'tracker' });
    } else {
      return { then: function() { return []; } };
    }
  };


  this.bounty_claim_create = function(issue_id, data) {
    data.issue_id = issue_id;
    return this.call("/bounty_claims", "POST", data);
  };

  this.bounty_claim_index = function() {
    return this.call("/bounty_claims");
  };

  this.bounty_claim_show = function(id) {
    return this.call("/bounty_claims/"+id);
  };

  this.bounty_claim_update = function(id, data) {
    return this.call("/bounty_claims/"+id, "PUT", data);
  };

  this.bounty_claim_destroy = function(id) {
    return this.call("/bounty_claims/"+id, "DELETE");
  };

  this.bounty_claim_show = function(id) {
    return this.call("/bounty_claims/"+id);
  };

  this.bounty_claim_accept = function(id, description) {
    return this.call("/bounty_claims/"+id+"/response/accept", "PUT", { description: description });
  };

  this.bounty_claim_reject = function(id, description) {
    return this.call("/bounty_claims/"+id+"/response/reject", "PUT", { description: description });
  };

  this.bounty_claim_resolve = function(id, description) {
    return this.call("/bounty_claims/"+id+"/response/resolve", "PUT", { description: description });
  };

  this.bounty_claim_reset = function(id) {
    return this.call("/bounty_claims/"+id+"/response/reset", "PUT");
  };

  this.person_teams = function(person_id) {
    return this.call("/people/"+person_id+"/teams");
  };

  this.followed_trackers = function() {
    return this.call('/trackers/followed');
  };

  this.trackers_get = function() {
    return this.call("/projects");
  };

  this.top_trackers_get = function() {
    return this.call("/trackers", "GET", { filter: "top" });
  };

  this.claim_tracker = function(id, owner_id, owner_type) {
    return this.call("/trackers/"+id+"/claim", "POST", {owner_id: owner_id, owner_type: owner_type});
  };

  this.unclaim_tracker = function(id, owner_id, owner_type) {
    return this.call("/trackers/"+id+"/unclaim", "POST", {owner_id: owner_id, owner_type: owner_type});
  };

  this.tracker_plugins_get = function() {
    return this.call("/tracker_plugins");
  };

  this.tracker_plugin_create = function(tracker_id, data) {
    data.tracker_id = tracker_id;
    return this.call("/tracker_plugins", "POST", data);
  };

  this.job_finished = function(id) {
    var deferred = $q.defer();
    this.call("/jobs/"+id+"/poll", function(response) {
      if (response.meta.status === 304) {
        deferred.resolve(false);
      } else {
        deferred.resolve(true);
      }
    });
    return deferred.promise;
  };

  this.start_solution = function(issue_id, data) {
    return this.call("/issues/"+issue_id+"/solution", "POST", data, function(response) {
      $api.require_signin($location.path(), { show_new_solution_form: true, code_url: data.url, completion_date: data.completion_date, note: data.note });
      return response.data;
    });
  };

  this.update_solution = function (issue_id, data) {
    return this.call("issues/"+issue_id+"/solution", "PUT", data);
  };

  this.restart_solution = function (issue_id, data) {
    return this.call("/issues/"+issue_id+"/solution/start_work", "POST", data);
  };

  this.stop_solution = function(issue_id) {
    return this.call("/issues/"+issue_id+"/solution/stop_work", "POST");
  };

  this.checkin_solution = function(issue_id) {
    return this.call("/issues/"+issue_id+"/solution/check_in", "POST");
  };

  this.complete_solution = function(issue_id) {
    return this.call("/issues/"+issue_id+"/solution/complete_work", "POST");
  };

  this.solution_get = function(issue_id) {
    return this.call("/issues/"+issue_id+"/solution", "GET");
  };

  this.solutions_get = function(issue_id) {
    return this.call("/issues/"+issue_id+"/solutions", "GET");
  };

  this.create_developer_goal = function(issue_id, data) {
    return this.call("/issues/"+issue_id+"/developer_goals", "POST", data, function (response) {
      $api.require_signin();
      return response.data;
    });
  };

  this.update_developer_goal = function(issue_id, data) {
    return this.call("/issues/"+issue_id+"/developer_goal", "PUT", data);
  };

  this.delete_developer_goal = function(issue_id) {
    return this.call("/issues/"+issue_id+"/developer_goal", "DELETE");
  };

  this.get_developer_goal = function(issue_id) {
    return this.call("/issues/"+issue_id+"/developer_goal", "GET");
  };

  this.get_developer_goals = function(issue_id) {
    return this.call("/issues/"+issue_id+"/developer_goals", "GET");
  };

  // these should probably go in an "AuthenticationController" or something more angular

  this.signin = function(form_data) {
    return this.call("/user/login", "POST", { email: form_data.email, password: form_data.password, account_link_id: form_data.account_link_id, mixpanel_id: form_data.mixpanel_id }, function(response) {
      if (response.meta.status === 200) {
        // NOTE: /user/login doesn't return the same as /user... so to be safe we make another api call
        $api.signin_with_access_token(response.data.access_token);
      }
      return response.data;
    });
  };

  this.set_current_person = function(person) {
    if (person && person.error) {
      // don't do anything
    } else if (person) {
      // FIXME: special case when updating set_current_person with a newer version of the same personect but it's missing an access_token
      if (person && $rootScope.current_person && (person.id === $rootScope.current_person.id) && !person.access_token && $rootScope.current_person.access_token) {
        person.access_token = $rootScope.current_person.access_token;
      }

      $rootScope.current_person = angular.copy(person);
      $api.set_access_token($rootScope.current_person.access_token);

      // Identify with Mixpanel HERE
      $analytics.mixpanel.identify(person.id);
    } else {
      $rootScope.current_person = false;
      $api.set_access_token(null);
    }
  };

  this.set_post_auth_url = function(url, params) {
    // Add boolean to show account complete modal after signin.
    params = params || {};
    params = angular.extend(params, { show_profile_modal: 1 });

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
    if (new_access_token) {
      // TODO: need secure cookies support in angularjs -- https://github.com/angular/angular.js/issues/950
      $cookieStore.put(this.access_token_cookie_name, new_access_token);
    } else {
      $cookieStore.remove(this.access_token_cookie_name);
    }

    return new_access_token;
  };

  this.get_access_token = function() {
    return $cookieStore.get(this.access_token_cookie_name);
  };

  this.load_current_person_from_cookies = function() {
    var access_token = $api.get_access_token();
    if (access_token) {
      //console.log("Verifying access token: " + access_token);
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

    var redirect_params = {
      provider: provider,
      follow_tracker_ids: (options.follow_tracker_ids || []).join(',')
    };

    options.redirect_url = protocol + '://' + host + (port === DEFAULT_PORTS[protocol] ? '' : ':'+port ) + '/signin/callback?' + $api.toKeyValue(redirect_params);

    options.mixpanel_id = $analytics.mixpanel_distinct_id();

    if ($api.get_access_token()) {
      options.access_token = $api.get_access_token();
    }

    return $rootScope.api_host.replace(/\/$/,'') + '/auth/' + provider + '?' + $api.toKeyValue(options);
  };

  this.encodeUriQuery = function(val, pctEncodeSpaces) {
    return $filter('encodeUriQuery')(val, pctEncodeSpaces);
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
});
