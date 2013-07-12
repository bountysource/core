'use strict';

window.BS_ENV = (document.location.host === 'www.bountysource.com' ? 'prod' : 'qa');

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
  });

'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/faq', {
        templateUrl: 'pages/about/faq.html',
        controller: 'Static'
      });
  });

'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fees', {
        templateUrl: 'pages/about/fees.html',
        controller: 'Static'
      });
  });

'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/about/history', {
        templateUrl: 'pages/about/history.html',
        controller: 'Static'
      });
  });

'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/jobs', {
        templateUrl: 'pages/about/jobs.html',
        controller: 'Static'
      });
  });

'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/learn', {
        templateUrl: 'pages/about/learn.html',
        controller: 'Static'
      });
  });

'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/privacy', {
        templateUrl: 'pages/about/privacy_policy.html',
        controller: 'Static'
      });
  });

'use strict';

angular.module('app')
  .controller('Static', function () {
    // does absolutely nothing... inherit this for static pages!!
    return true;
  });
'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/terms', {
        templateUrl: 'pages/about/terms.html',
        controller: 'Static'
      });
  });

'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/activity/bounties', {
        templateUrl: 'pages/activity/bounties.html',
        controller: 'BountyActivity',
        resolve: $person
      });
  })
  .controller('BountyActivity', function($scope, $routeParams, $api) {
    $scope.bounties = $api.bounty_activity();

    $scope.toggle_anonymous = function(bounty) {
      $api.bounty_anonymity_toggle(bounty).then(function() {
        bounty.anonymous = !bounty.anonymous;
      });
    };
  });


'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/activity/fundraisers', {
        templateUrl: 'pages/activity/fundraisers.html',
        controller: 'FundraiserActivity',
        resolve: $person
      });
  })
  .controller('FundraiserActivity', function($scope, $routeParams, $api) {
    $scope.fundraisers = $api.fundraiser_activity();
  });


'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/activity/pledges', {
        templateUrl: 'pages/activity/pledges.html',
        controller: 'PledgeActivity',
        resolve: $person
      });
  })
  .controller('PledgeActivity', function($scope, $routeParams, $api) {
    $scope.pledges = $api.pledge_activity();

    $scope.toggle_anonymous = function(pledge) {
      $api.pledge_anonymity_toggle(pledge).then(function() {
        pledge.anonymous = !pledge.anonymous;
      });
    };
  });


'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/activity/solutions', {
        templateUrl: 'pages/activity/solutions.html',
        controller: 'SolutionActivity',
        resolve: $person
      });
  })
  .controller('SolutionActivity', function($scope, $routeParams, $api) {
    $scope.solutions = $api.solution_activity();
  });


'use strict';

angular.module('app')
  .controller('ActivityTabs', function($scope, $location) {
    $scope.tabs = [
      { name: 'Timeline', url: '/activity' },
      { name: 'Bounties', url: '/activity/bounties' },
      { name: 'Fundraisers', url: '/activity/fundraisers' },
      { name: 'Pledges', url: '/activity/pledges' },
      { name: 'Solutions', url: '/activity/solutions' }
    ];
    $scope.is_active = function(url) {
      return url === $location.path();
    };

  });

'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/activity', {
        templateUrl: 'pages/activity/timeline.html',
        controller: 'Activity',
        resolve: $person
      });
  })
  .controller('Activity', function($scope, $routeParams, $api) {
    console.log("whee activity controller");
    $scope.timeline = $api.person_timeline_get($scope.current_person.id);
  });


'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/activity/transactions', {
        templateUrl: 'pages/activity/transactions.html',
        controller: 'TransactionActivity',
        resolve: $person
      });
  })
  .controller('TransactionActivity', function($scope, $routeParams, $api) {
    $scope.transactions = $api.transaction_activity();
  });


'use strict';

angular.module('api.bountysource',[]).
  service('$api', function($http, $q, $cookieStore, $rootScope, $location, $window) {
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
      params.callback = 'JSON_CALLBACK';
      params._method = method;
      if ($cookieStore.get($api.access_token_cookie_name)) {
        params.access_token = $cookieStore.get($api.access_token_cookie_name);
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
        if (res.meta.success) {
          res.data.funding_percentage = Math.ceil((res.data.total_pledged / res.data.funding_goal) * 100);
          res.data.can_manage = $rootScope.current_person && ($rootScope.current_person.admin || res.data.person.id === $rootScope.current_person.id);
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
      if (obj) {
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

    this.goto_post_auth_url = function() {
      var redirect_url = $cookieStore.get('postauth_url') || '/';
      $cookieStore.remove('postauth_url');
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
      options.access_token = $cookieStore.get($api.access_token_cookie_name);
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
        $rootScope.$watch('current_person', function(new_val) {
          console.log('oh hai current_person', new_val);
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

"use strict";

angular.module('app')
  .config(function($routeProvider, $person) {
    $routeProvider
      .when("/auth/:provider/confirm", {
        templateUrl: "/pages/auth/auth.html",
        controller: "AuthConfirmController",
        resolve: $person
      });
  })
  .controller("AuthConfirmController", function($scope, $routeParams, $window, $location, $api) {
    $scope.provider = $routeParams.provider;
    console.log("auth confirm", $routeParams.provider);

    $scope.accept = function() {
      $scope.pending_connect = true;

      var connect_params = angular.copy($routeParams);
      delete connect_params.provider;

      $api.approve_connect($scope.provider, connect_params).then(function(response) {
        if (response.error) {
          $scope.error = response.error;
        } else {
          $scope.pending_connect = false;
          $scope.redirecting = true;

          $window.setTimeout(function() {
            $window.location = response.redirect_url;
          }, 1500);
        }
      });

//      setTimeout(function(){ $scope.pending_connect = false; }, 1000);
    };

    $scope.reject = function() {
      if ($routeParams.redirect_url) {
        $window.location = $routeParams.redirect_url;
      } else {
        $location.url("/");
      }
    };
  });
'use strict';

angular.module('app').
  directive('ngFocus', ['$parse', function($parse) {
    return function(scope, element, attr) {
      var fn = $parse(attr.ngFocus);
      element.bind('focus', function(event) {
        scope.$apply(function() {
          fn(scope, {$event:event});
        });
      });
    };
  }]).
  directive('ngBlur', ['$parse', function($parse) {
    return function(scope, element, attr) {
      var fn = $parse(attr.ngBlur);
      element.bind('blur', function(event) {
        scope.$apply(function() {
          fn(scope, {$event:event});
        });
      });
    };
  }]).
  directive('ngClickRequireAuth', ['$parse', '$api', function($parse, $api) {
    return {
      restrict: "A",
      link: function(scope, element, attr) {
        var action = $parse(attr.ngClickRequireAuth);
        element.bind('click', function(event) {
          scope.$apply(function() {
            if (scope.current_person) {
              action(scope, {$event: event});
            } else {
              // if it has an href attribute, save that as the postauth URL
              var url = element.attr('href');
              element.removeAttr('href');
              element.removeAttr('ng-href'); // don't know if this actually has to be removed. oh well.
              $api.require_signin(url);
            }
          });
        });
      }
    };
  }]).
  directive('requireTwitter', ['$twttr', function($twttr) {
    return {
      restrict: "A",
      scope: "isolate",
      link: function() { $twttr.widgets.load(); }
    };
  }]).
  directive('requireGplus', ['$gplus', function($gplus) {
    return {
      restrict: "A",
      scope: "isolate",
      link: function() { $gplus.plusone.go(); } // $gplus.widgets.load();
    };
  }]).
  directive('selectOnClick', function () {
    return {
      restrict: "A",
      link: function (scope, element) {
        element.bind('click', function() {
          element[0].select();
        });
      }
    };
  }).
  directive('fundraiserCard', function() {
    return {
      restrict: "E",
      scope: {
        fundraiser: "="
      },
      templateUrl: "pages/fundraisers/partials/homepage_card.html"
    };
  }).
  directive('projectCard', function() {
    return {
      restrict: "E",
      scope: {
        project: "="
      },
      templateUrl: "pages/trackers/partials/homepage_card.html"
    };
<<<<<<< HEAD
  });
=======
  }).
  directive('requireGithubAuth', ["$api", "$window", "$location", function($api, $window, $location) {
    // TODO support more than 1 scope
    return {
      restrict: "A",
      link: function(scope, element, attr) {
        element.bind('click', function() {
          scope.$apply(function() {
            if (scope.current_person) {
              $api.set_post_auth_url($location.path());
              var permission = attr.requireGithubAuth;

              if (scope.current_person.github_account) {
                if (permission && scope.current_person.github_account.permissions && scope.current_person.github_account.permissions.indexOf(permission) < 0) {
                  // need to redirect to get dat permission
                  $window.location = $api.signin_url_for('github', { scope: [permission] });
                }
              } else {
                $window.location = $api.signin_url_for('github', { scope: [permission] });
              }
            } else {
              $api.require_signin();
            }
          });
        });
      }
    };
  }]);
>>>>>>> upstream/bootstrap-angular

'use strict';

angular.module('app').
  filter('percent', function () {
    return function (input) {
      return Math.round(100 * input) + '%';
    };
  }).filter('dollars', function ($filter) {
    var currency = $filter('currency');
    return function(input) {
      return currency(input, '$').replace(/\.\d\d$/,'');
    };
  }).filter('round', function () {
    return function (input) {
      return Math.round(input);
    };
  }).filter('at_least', function () {
    return function (input, other) {
      return (input > other) ? input : other;
    };
  }).filter('at_most', function () {
    return function (input, other) {
      return (input < other) ? input : other;
    };
  }).filter('slice', function() {
    return function(a,start,end) {
      if (!a) { return []; }
      return a.slice(start,end);
    };
  }).filter('truncate', function() {
    // truncate string, add '...' or custom text.
    // note, size is the EXACT length of the string returned,
    // which factors in the length of replacement.
    //
    // $scope.text = "Apples are delicious"
    // <span>{{ text | truncate:12 }}</span> ==> <span>Apples ar...</span>
    return function(s, size, replacement) {
      size = size || 50;
      replacement = replacement || "...";
      if (!s || s.length <= (size + replacement.length)) {
        return s;
      }
      return s.slice(0,size+replacement.length) + replacement;
    };
  }).filter('from_snake_case', function() {
    // Convert snakecase to words
    return function(s) {
      var parts = s.replace(/[_-]/g, " ").split(" ");
      var new_parts = [];
      for (var i=0; i<parts.length; i++) { new_parts.push(parts[i][0] + parts[i].slice(1)); }
      return new_parts.join(" ");
    };
  }).filter('title', function() {
    // Capitalize all words
    return function(s) {
      var parts = s.split(" ");
      var new_parts = [];
      for (var i=0; i<parts.length; i++) { new_parts.push(parts[i][0].toUpperCase() + parts[i].slice(1)); }
      return new_parts.join(" ");
    };
  }).filter('pluralize', function() {
    // add 's' to string if num is not 1
    return function(s,num) {
      return s + (num !== 1 ? 's' : '');
    };
  }).filter('solution_status', function() {
    return function(solution) {
      if (!solution) { return ""; }
      if (solution.rejected) { return 'rejected'; }
      else if (solution.disputed) { return 'disputed'; }
      else if (solution.accepted && !solution.paid_out) { return 'accepted'; }
      else if (solution.accepted && solution.paid_out) { return 'paid_out'; }
      else if (solution.submitted && !solution.merged) { return 'pending_merge'; }
      else if (solution.in_dispute_period && !solution.disputed && !solution.accepted) { return 'in_dispute_period'; }
      else if (!solution.submitted) { return 'started'; }
      else { return ""; }
    };
  }).filter('solution_progress_description', function($filter) {
    var get_status = $filter('solution_status');
    return function(solution) {
      var status = get_status(solution);
      if (status === "started") { return "You have started working on a solution."; }
      else if (status === "pending_merge") { return "Your solution has been submitted. Waiting for the issue to be resolved"; }
      else if (status === "in_dispute_period") { return "The issue has been resolved, and your solution is in the dispute period."; }
      else if (status === "disputed") { return "Your solution has been disputed."; }
      else if (status === "rejected") { return "Your solution has been rejected."; }
      else if (status === "paid_out") { return "You have claimed the bounty for this issue."; }
      else if (status === "accepted") { return "Your solution has been accepted!"; }
      else { return ""; }
    };
  }).filter('fundraiser_status', function() {
    return function(fundraiser) {
      if (!fundraiser) { return ""; }
      if (!fundraiser.published) { return "draft"; }
      else if (fundraiser.published && fundraiser.in_progress) { return "published"; }
      else if (!fundraiser.in_progress) { return "completed"; }
      else { return ""; }
    };
  });


'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:fundraiser_id/updates/:id/edit', {
        templateUrl: 'pages/fundraiser_updates/edit.html',
        controller: 'FundraiserEditUpdateController'
      });
  })

  .controller('FundraiserEditUpdateController', function ($scope, $routeParams, $location, $api) {
    $scope.changes = {};

    $scope.fundraiser = $api.fundraiser_update_get($routeParams.fundraiser_id, $routeParams.id, function(response) {
      $scope.update = response.data.update;
      $scope.changes = $scope.update;
      return response.data;
    });

    $scope.save = function() {
      $api.fundraiser_update_edit($routeParams.fundraiser_id, $routeParams.id, $scope.changes, function(response) {
        if (response.meta.success) {
          $scope.back();
        } else {
          $scope.error = response.data.error;
        }
      });
    };

    $scope.back = function() {
      $location.url("/fundraisers/"+$routeParams.fundraiser_id+"/updates/"+$routeParams.id);
    };
  });

'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:fundraiser_id/updates/:id', {
        templateUrl: 'pages/fundraiser_updates/show.html',
        controller: 'FundraiserUpdatesShow'
      });
  })

  .controller('FundraiserUpdatesShow', function ($scope, $routeParams, $location, $api) {
    $scope.fundraiser = $api.fundraiser_update_get($routeParams.fundraiser_id, $routeParams.id).then(function(response) {
      $scope.update = response.update;
      return response;
    });

    $scope.publish = function() {
      $api.fundraiser_update_publish($routeParams.fundraiser_id, $routeParams.id, function(response) {
        if (response.meta.success) {
          // update the... update
          $scope.update = angular.copy(response.data.update);

          $location.url("/fundraisers/"+$routeParams.fundraiser_id+"/updates/"+$routeParams.id);
        } else {
          $scope.error = response.data.error;
        }
        return response.data;
      });
    };

    $scope.destroy = function() {
      $api.fundraiser_update_destroy($routeParams.fundraiser_id, $routeParams.id, function(response) {
        if (response.meta.success) {
          $location.url("/fundraisers/"+$routeParams.fundraiser_id+"/updates");
        } else {
          $scope.error = response.data.error;
        }
      });
    };
  });

'use strict';

angular.module('app')
  .controller('FundraisersController', function ($scope) {
    $scope.fundraiser.then(function(res) {
      $scope.can_manage = res.person && $scope.current_person && res.person.id === $scope.current_person.id;
      $scope.publishable = res.title && res.short_description && res.funding_goal && res.description;
      return res;
    });
  });

'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/fundraisers/new', {
        templateUrl: 'pages/fundraisers/create.html',
        controller: 'FundraiserCreateController',
        resolve: $person
      });
  })

  .controller('FundraiserCreateController', function($scope, $routeParams, $location, $api) {
    $scope.fundraiser = {
      funding_goal: 25000,
      total_pledged: 0,
      pledge_count: 0,
      funding_percentage: 0,
      days_remaining: 30
    };

    $scope.create = function() {
      $api.fundraiser_create($scope.fundraiser, function(response) {
        if (response.meta.success) {
          $location.url("/fundraisers/"+response.data.slug+"/edit");
        } else {
          $scope.error = response.data.error;
        }
      });
    };
  });

'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id/edit', {
        templateUrl: 'pages/fundraisers/edit.html',
        controller: 'FundraiserEditController'
      });
  })

  .controller('FundraiserEditController', function($scope, $routeParams, $location, $api) {
    // initialize fundraiser data and changes
    $scope.master = {};
    $scope.changes = {};
    $scope.rewards = [];
    $scope.master_rewards = [];

    $scope.unsaved_changes = function() {
      return !angular.equals($scope.master, $scope.changes);
    };

    $scope.fundraiser = $api.fundraiser_get($routeParams.id).then(function(response) {
      // cache the fundraiser. angular.copy does a deep copy, FYI
      // if you don't create a copy, these are both bound to the input
      $scope.master = angular.copy(response);
      $scope.changes = angular.copy(response);

      // also cache rewards
      $scope.master_rewards = angular.copy(response.rewards);
      return response;
    });

    $scope.cancel = function() { $location.url("/fundraisers/"+$scope.master.slug); };

    $scope.save = function() {
      $api.fundraiser_update($routeParams.id, $scope.changes).then(function(response) {
        if (response.error) {
          $scope.error = response.error;

          // TODO replace master reward with the current one
        } else {
          $location.path("/fundraisers/"+$scope.master.slug);
        }
      });
    };
  })

  .controller('RewardsController', function($scope, $api) {
    $scope.new_reward = {};

    $scope.create_reward = function(fundraiser) {
      $api.reward_create(fundraiser.id, $scope.new_reward, function(response) {

        if (response.meta.success) {
          // reset the new_reward model
          $scope.new_reward = {};

          // push this new reward onto the table
          fundraiser.rewards.push(response.data);
        } else {
          $scope.reward_error = response.data.error;
        }
      });
    };

    $scope.update_reward = function(fundraiser, reward) {
      $api.reward_update(fundraiser.id, reward.id, reward, function(response) {
        if (response.meta.success) {
          for (var i=0; i<$scope.rewards.length; i++) {
            if ($scope.rewards[i].id === reward.id) {
              // copy attributes from current reward to master
              for (var k in $scope.rewards[i]) {
                $scope.master_rewards[i][k] = $scope.rewards[i][k];
              }
              $scope.rewards[i].$is_open = false;
              return;
            }
          }
        } else {
          $scope.reward_error = response.data.error;
        }
      });
    };

    $scope.cancel_reward_changes = function(reward) {
      for (var i=0; i<$scope.master_rewards.length; i++) {
        if ($scope.master_rewards[i].id === reward.id) {
          // copy attributes from master reward to this one
          for (var k in $scope.master_rewards[i]) {
            $scope.rewards[i][k] = $scope.master_rewards[i][k];
          }
          $scope.rewards[i].$is_open = false;
          return;
        }
      }
    };

    $scope.destroy_reward = function(fundraiser, reward) {
      $api.reward_destroy(fundraiser.id, reward.id, function(response) {
        if (response.meta.success) {
          // traverse the cached rewards, and remove this one
          for (var i=0; i<fundraiser.rewards.length; i++) {
            if (fundraiser.rewards[i].id === reward.id) {
              fundraiser.rewards.splice(i,1);
              break;
            }
          }
        }
      });
    };
  });

'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers', {
        templateUrl: 'pages/fundraisers/index.html',
        controller: 'FundraisersIndex'
      });
  })
  .controller('FundraisersIndex', function ($scope, $routeParams, $api) {
    $scope.fundraiser = $api.fundraiser.find($routeParams.id);
  });


'use strict';

angular.module('app').controller('FundraiserNavTabsController', function ($scope, $location) {
  $scope.active_tab = function(name) {
    if (name === 'overview' && (/^\/fundraisers\/[a-z-_0-9]+$/i).test($location.path())) { return "active"; }
    if (name === 'updates' && (/^\/fundraisers\/[a-z-_0-9]+\/updates$/i).test($location.path())) { return "active"; }
    if (name === 'pledges' && (/^\/fundraisers\/[a-z-_0-9]+\/pledges$/i).test($location.path())) { return "active"; }
    if (name === 'rewards' && (/^\/fundraisers\/[a-z-_0-9]+\/rewards$/i).test($location.path())) { return "active"; }
    if (name === 'pledge_now' && (/^\/fundraisers\/[a-z-_0-9]+\/pledge$/i).test($location.path())) { return "active"; }
  };
});


'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id/rewards', {
        templateUrl: 'pages/fundraisers/rewards.html',
        controller: 'FundraiserRewardsInfoController'
      });
  })

  .controller('FundraiserRewardsInfoController', function ($scope, $routeParams, $location, $api) {
    $scope.fundraiser = $api.fundraiser_info_get($routeParams.id).then(function(response) {
      $scope.rewards = response.rewards;

      // initially open all of the tabs
      angular.forEach($scope.rewards, function(r) { r.$is_open = true; });

      return response;
    });

    $scope.expand_all = true;
    $scope.toggle_expand_all = function() {
      $scope.expand_all = !$scope.expand_all;
      for (var i=0; i<$scope.rewards.length; i++) { $scope.rewards[i].$is_open = $scope.expand_all; }
    };
  });

'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id', {
        templateUrl: 'pages/fundraisers/show.html',
        controller: 'FundraiserShowController'
      });
  })

  .controller('FundraiserShowController', function ($scope, $routeParams, $location, $window, $api, $sanitize) {
    $scope.fundraiser = $api.fundraiser_get($routeParams.id);

    // $sanitize but allow iframes (i.e. youtube videos)
    $scope.fundraiser.then(function(fundraiser) {
      var html = fundraiser.description_html;
      var matches = html.match(/<iframe[^>]+><\/iframe>/g) || [];
      for (var i=0; i < matches.length; i++) {
        html = html.replace(matches[i], '{{iframe:'+i+'}}');
      }
      html = $sanitize(html);
      for (i=0; i < matches.length; i++) {
        html = html.replace('{{iframe:'+i+'}}', matches[i]);
      }
      $scope.sanitized_description = html;
    });

    $scope.publish = function(fundraiser) {
      $api.fundraiser_publish(fundraiser.id, function(response) {
        if (response.meta.success) {
          // TODO I do not know why this doesn't work: $location.url("/fundraisers/"+fundraiser.slug).replace();
          $window.location = "/fundraisers/"+fundraiser.slug;
        } else {
          $scope.error = "ERROR: " + response.data.error;
        }

        return response.data;
      });
    };
  });

'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id/updates', {
        templateUrl: 'pages/fundraisers/updates.html',
        controller: 'FundraiserUpdatesController'
      });
  })

  .controller('FundraiserUpdatesController', function ($scope, $routeParams, $location, $api) {
    $scope.fundraiser = $api.fundraiser_get($routeParams.id).then(function(response) {
      $scope.updates = response.updates;
      return response;
    });

    $scope.create_update = function() {
      $api.fundraiser_update_create($routeParams.id, {}, function(response) {
        if (response.meta.success) {
          var fundraiser = response.data;
          var update = response.data.update;
          $location.url("/fundraisers/"+fundraiser.slug+"/updates/"+update.id+"/edit");
        } else {
          $scope.error = response.data.error;
        }
      });
    };
  });

'use strict';

window._gaq = window._gaq || [];
window._gaq.push(['_require', 'inpage_linkid', '//www.google-analytics.com/plugins/ga/inpage_linkid.js']);
window._gaq.push(['_setAccount', document.location.host === 'www.bountysource.com' ? 'UA-36879724-1' : 'UA-36879724-2']);
(function(d,t){
  var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
  g.src=('https:'===location.protocol?'//ssl':'//www')+'.google-analytics.com/ga.js';
  s.parentNode.insertBefore(g,s);
}(document,'script'));

angular.module('app').run(function($rootScope, $window, $location) {
  $rootScope.$on('$viewContentLoaded', function() {
    $window._gaq.push(['_trackPageview', $location.path()]);
  });
});
'use strict';
(function(d,t) {
  var g=d.createElement(t),s=document.getElementsByTagName(t)[0];
  g.src = (window.BS_ENV === 'prod' ? 'https://wallet.google.com/inapp/lib/buy.js' : 'https://sandbox.google.com/checkout/inapp/lib/buy.js');
  s.parentNode.insertBefore(g,s);
}(document,'script'));

'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'pages/home/home.html',
        controller: 'HomeCtrl'
      });
  })
  .controller('HomeCtrl', function ($scope, $window, $api) {
    $scope.fundraisers = $api.fundraiser_cards();

    // $scope.recent_people = $api.people_recent();
    $api.people_interesting().then(function(people) {
      $scope.people = people;
    });

    $scope.trackers = $api.project_cards().then(function(trackers) {
      for (var i=0; i<trackers.length; i++) {
        trackers[i].bounty_total = parseFloat(trackers[i].bounty_total);
      }
      return trackers;
    });
  });

'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/search', {
        templateUrl: 'pages/home/search.html',
        controller: 'SearchController'
      });
  })

  .controller('NavbarSearchController', function ($scope, $location) {
    $scope.search_query = null;
    $scope.submit_search = function() {
      if ($scope.search_query && $scope.search_query.length > 0) {
        $location.path("/search").search({ query: $scope.search_query });
      }
    };
  })

  .controller('SearchController', function ($scope, $location, $routeParams, $api) {
    $scope.search_query = $routeParams.query;
    $scope.search_query_submitted = (angular.isDefined($scope.search_query) && $scope.search_query.length > 0);
    $scope.search_pending = $scope.search_query_submitted;

    $scope.submit_search = function() {
      if ($scope.search_query.length > 0) {
        $scope.search_query_submitted = true;
        $scope.search_pending = true;

        $api.search($scope.search_query).then(function(response) {
          $scope.search_pending = false;

          // did we recognize this as a URL? Redirect to the appropriate issue or project page.
          if (response.redirect_to) {
            // LEGACY replace the '#' with '/'
            var url = response.redirect_to;
            if (url[0] === '#') {
              url = '/' + url.slice(1);
            }
            $location.path(url).replace();
          } else if (response.create_issue) {
            // oh no, nothing was found! redirect to page to create issue for arbitrary URL
            $location.path("/issues/new").search({ url: $scope.search_query }).replace();
          } else {
            // just render normal search results, returned by the API as
            // response.trackers and response.issues
            $scope.results = response;
          }
        });
      }
    };

    if ($routeParams.query) { $scope.submit_search(); }

    $scope.search_filter = null;
    $scope.filter_search_results = function(result) {
      if (!$scope.search_filter) { return true; }
      var regex = new RegExp(".*?"+$scope.search_filter+".*?", "i");

      if (result.title) {
        // it is an issue
        return regex.test(result.title);
      } else if (result.name) {
        // it is a project
        return regex.test(result.name);
      }

      // if it is neither an issue nor a project, just show it
      // (though that won't happen with the current API response)
      return true;
    };
  });

'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/:id/bounties', {
        templateUrl: 'pages/issues/bounties.html',
        controller: 'IssueBountiesController'
      });
  })

  .controller('IssueBountiesController', function ($scope) {
    $scope.sort_column = 'amount';
    $scope.sort_reverse = true;

    $scope.sort_by = function(col) {
      // if clicking this column again, then reverse the direction.
      if ($scope.sort_column === col) {
        $scope.sort_reverse = !$scope.sort_reverse;
      } else {
        $scope.sort_column = col;
      }
    };
  });


'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/:id/comments', {
        templateUrl: 'pages/issues/comments.html',
        controller: 'IssueCommentsController'
      });
  })

  .controller('IssueCommentsController', function ($scope, $routeParams, $api) {
    console.log($scope, $routeParams, $api);
  });


'use strict';

angular.module('app').controller('DeveloperBoxController', function ($scope, $routeParams, $location, $api) {

  $scope.issue.then(function(issue) {

    issue.create_solution = function() {
      $api.solution_create(issue.id, function(response) {
        if (response.meta.success) {
          issue.my_solution = response.data;
          issue.solutions.push(issue.my_solution);

          // this is usually set by the solutions controller. womp womp
          issue.my_solution.$percentage = 25;
        } else {
          $scope.error = response.data.error;
        }
      });
    };

    // do you has a solution?
    issue.my_solution = null;
    for (var i in issue.solutions) {
      if ($scope.current_person && issue.solutions[i].person.id === $scope.current_person.id) {
        issue.my_solution = issue.solutions[i];
        break;
      }
    }
  });

});

"use strict";

angular.module('app').controller('IssueNavTabsController', function($scope, $location) {
  $scope.active_tab = function(name) {
    if (name === 'overview' && (/^\/issues\/[a-z-_0-9]+$/i).test($location.path())) { return "active"; }
    if (name === 'comments' && (/^\/issues\/[a-z-_0-9]+\/comments$/).test($location.path())) { return "active"; }
    if (name === 'bounties' && (/^\/issues\/[a-z-_0-9]+\/bounties$/).test($location.path())) { return "active"; }
    if (name === 'solutions' && (/^\/issues\/[a-z-_0-9]+\/solutions$/).test($location.path())) { return "active"; }
  };
});
'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/new', {
        templateUrl: 'pages/issues/new.html',
        controller: 'IssueCreateController'
      });
  })

  .controller('IssueCreateController', function ($scope, $location, $api) {
    $scope.new_issue = {};

    $scope.create_issue = function() {
      $scope.error = null;
      $api.issue_create($scope.new_issue, function(response) {
        if (response.meta.success) {
          $location.url("/issues/"+response.data.slug).replace();
        } else {
          $scope.error = response.data.error;
        }
      });
    };
  });


'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/:id', {
        templateUrl: 'pages/issues/show.html',
        controller: 'IssueShow'
      });
  })

  .controller('IssueShow', function ($scope, $routeParams, $window, $location, $payment, $api) {
    $scope.bounty = {
      amount: parseInt($routeParams.amount, 10),
      anonymous: $routeParams.anonymous || false,
      payment_method: $routeParams.payment_method || 'google'
    };

    $scope.issue = $api.issue_get($routeParams.id, function(response) {
      var issue = response.data;

      // append item number now that we have issue
      $scope.bounty.item_number = "issues/"+issue.id;

      $scope.create_payment = function() {
        var base_url = $window.location.href.replace(/\/issues.*$/,'');
        var payment_params = angular.copy($scope.bounty);

        payment_params.success_url = base_url + "/activity/bounties";
        payment_params.cancel_url = $window.location.href;

        $payment.process(payment_params, {
          error: function(response) {
            console.log("Payment Error:", response);
          },

          noauth: function() {
            $api.set_post_auth_url("/issues/" + issue.slug, payment_params);
            $location.url("/signin");
          }
        });
      };

      return issue;
    });
  });


'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/:id/solutions', {
        templateUrl: 'pages/issues/solutions.html',
        controller: 'IssueSolutionsController'
      });
  })

  .controller('IssueSolutionsController', function ($scope, $routeParams, $location, $api) {

    $scope.issue = $api.issue_get($routeParams.id).then(function(issue) {
      // set solution accepted bounty claim model
      $scope.$init_bounty_claim(issue);

      // make solutions disputable
      // store them on $scope.issue.solutions
      $scope.$init_solutions(issue);

      // select the current user's solution if it's there.
      // store it on $scope.issue.my_solution
      $scope.$locate_my_solution(issue);

      // find the logged in users bounty, if present.
      // need this to determine whether or not they can
      // dispute solutions.
      $scope.locate_my_bounty(issue);

      return issue;
    });

    $scope.locate_my_bounty = function(issue) {
      // TODO: note, this skips past anonymous pledges. might break things if it's your bounty that is anonymous
      $scope.my_bounty = null;
      for (var i=0; $scope.current_person && i<issue.bounties.length; i++) {
        if (issue.bounties[i].person && issue.bounties[i].person.id === $scope.current_person.id) {
          $scope.my_bounty = issue.bounties[i];
          break;
        }
      }
    };

    $scope.solution_submit = { body: "", code_url: "" };

    $scope.charity_focus = function(donation) { donation.$show_info = true; };
    $scope.charity_blur = function(donation) { donation.$show_info = false; };

    $scope.$init_bounty_claim = function(issue) {
      $scope.bounty_claim = {
        bounty_total: issue.bounty_total,
        donations: {
          eff: { amount: Math.floor(issue.bounty_total * 0.050), $show_info: false },
          fsf: { amount: Math.floor(issue.bounty_total * 0.025), $show_info: false },
          spi: { amount: Math.floor(issue.bounty_total * 0.025), $show_info: false },
          dwb: { amount: Math.floor(issue.bounty_total * 0.025), $show_info: false }
        },
        donation_total: 0,
        your_cut: issue.bounty_total
      };

      $scope.update_bounty_claim = function() {
        var donation_total = 0;
        for (var k in $scope.bounty_claim.donations) { donation_total += ($scope.bounty_claim.donations[k].amount || 0); }
        $scope.bounty_claim.donation_total = Math.min(donation_total, $scope.bounty_claim.bounty_total);
        $scope.bounty_claim.your_cut = Math.max(($scope.bounty_claim.bounty_total - donation_total), 0);
      };

      // initialize that shit.
      $scope.update_bounty_claim();
    };

    // form data for submitting solution
    $scope.my_solution_submit = {
      code_url: "",
      body: ""
    };

    $scope.$locate_my_solution = function(issue) {
      for (var i=0; $scope.current_person && i<issue.solutions.length; i++) {
        if (issue.solutions[i].person.id === $scope.current_person.id) {
          issue.my_solution = issue.solutions[i];
          break;
        }
      }

      // does the authenicated user have a solution?
      if (issue.my_solution) {
        // add submission method
        issue.my_solution.submit = function() {
          $scope.solution_error = null;

          // first update the solution...
          $api.solution_update(issue.my_solution.id, $scope.my_solution_submit, function(response) {
            if (response.meta.success) {
              //... then submit it!
              $api.solution_submit(issue.my_solution.id, function(response) {
                if (response.meta.success) {
                  $scope.my_solution = angular.copy(response.data);

                  // find the solution issue.solutions array and update its attributes
                  for (var i=0; i<issue.solutions.length; i++) {
                    if (issue.solutions[i].id === $scope.my_solution.id) {
                      for (var k in $scope.my_solution) { issue.solutions[i][k] = $scope.my_solution[k]; }
                      break;
                    }
                  }

                } else {
                  $scope.solution_error = response.data.error;
                }
              });
            } else {
              $scope.solution_error = response.data.error;
            }
          });
        };

        issue.my_solution.destroy = function() {
          console.log('TODO issue.my_solution.destroy');
        };

        if (issue.my_solution.accepted) {
          var default_donation_percentage = 0.05;
          var default_donation = (issue.bounty_total * default_donation_percentage);

          issue.my_solution.claim_bounty_data = {
            total: issue.bounty_total,
            donation: default_donation,
            dev_cut: issue.bounty_total  - default_donation
          };

          issue.my_solution.claim_bounty = function() {
            var donation_amounts = {
              eff_donation_amount: $scope.bounty_claim.donations.eff.amount,
              fsf_donation_amount: $scope.bounty_claim.donations.fsf.amount,
              spi_donation_amount: $scope.bounty_claim.donations.spi.amount,
              dwb_donation_amount: $scope.bounty_claim.donations.dwb.amount
            };

            $api.solution_payout(issue.my_solution.id, donation_amounts, function(response) {
              console.log(response);

              if (response.meta.success) {
                $location.url("/activity/solutions");
              } else {
                $scope.error = response.data.error;
              }
            });
          };
        }
      }

      // add model for submitting solution
      return $scope.issue.my_solution;
    };

    // add extra functionality and model data to a solution.
    $scope.$init_solution = function(issue, solution) {
      // calculate and add percentage to the model
      solution.$percentage = $scope.solution_percentage(solution);

      // add status
      solution.$status = $scope.solution_status(solution);

      // add dispute model
      solution.new_dispute = { body: "" };

      // add flag to show/hide the dispute form
      solution.$show_dispute = false;

      // init disputes to empty array. push the rest in asynchronously next
      solution.disputes = [];

      // push dispute and add extra methods, such as dispute resolve
      solution.push_dispute = function(dispute) {
        // if it's your dispute, store that now! only store if it is NOT CLOSED
        // make sure it references the array on solution
        // also, add a close method to it
        if (!dispute.closed && $scope.current_person.id === dispute.person.id) {
          solution.my_dispute = dispute;

          // add dispute resolution method
          dispute.resolve = function() {
            $api.dispute_resolve(issue.id, solution.id, solution.my_dispute.number, function(response) {
              if (response.meta.success) {
                solution.my_dispute.closed = true;

                // also, check to see if the issue can now be changed from 'disputed' to 'in dispute period'
                // this is pretty damn hacky...
                var change = true;
                for (var k in solution.disputes) { if (!solution.disputes[k].closed) { change = false; break; } }
                if (change) { solution.$status = 'In Dispute Period'; }
              } else {
                solution.my_dispute_error = response.data.error;
              }
            });
          };
        }
        solution.disputes.push(dispute);
      };

      // load disputes (different API call...)
      $api.disputes_get(issue.id, solution.id).then(function(disputes) {
        for (var j in disputes) { solution.push_dispute(disputes[j]); }
        return disputes;
      });

      // add dispute method (form action)
      solution.dispute = function() {
        $api.dispute_create(issue.id, solution.id, solution.new_dispute, function(response) {
          if (response.meta.success) {
            solution.$show_dispute = false;

            // manually change attributes, because YOLO
            solution.disputed = true;
            solution.$percentage = $scope.solution_percentage(solution);
            solution.$status = $scope.solution_status(solution);

            solution.push_dispute(response.data);
          } else {
            solution.dispute_error = response.data.error;
          }
        });
      };

      solution.$show_status_description = false;
      solution.$toggle_show_status_description = function() { solution.$show_status_description = !solution.$show_status_description; };
    };

    $scope.$init_solutions = function(issue) {
      var i;

      // if a solution was accepted, manually change the status of all issues to rejected.
      // the backend should do this.... kind of a hack for v2 development
      if (issue.accepted_solution) {
        // update all solutions except for that one to rejected status
        for (i=0; i<issue.solutions.length; i++) {
          if (issue.solutions[i].id !== issue.accepted_solution.id) {
            issue.solutions[i].rejected = true;
          }
        }
      }

      // now, go through and initialize solutions
      for (i in issue.solutions) { $scope.$init_solution(issue, issue.solutions[i]); }
    };

    $scope.solution_status = function(solution) {
      if (solution.rejected) { return 'rejected'; }
      else if (solution.disputed) { return 'disputed'; }
      else if (solution.accepted && !solution.paid_out) { return 'accepted'; }
      else if (solution.accepted && solution.paid_out) { return 'paid_out'; }
      else if (solution.submitted && !solution.merged) { return 'pending_merge'; }
      else if (solution.in_dispute_period && !solution.disputed && !solution.accepted) { return 'in_dispute_period'; }
      else if (!solution.submitted) { return 'started'; }
      else { return ""; }
    };

    $scope.solution_percentage = function(solution) {
      solution.$status = solution.$status || $scope.solution_status(solution);
      if (solution.$status === "started") { return 25; }
      else if (solution.$status === "pending_merge") { return 50; }
      else if (solution.$status === "in_dispute_period") { return 75; }
      else if (solution.$status === "disputed") { return 75; }
      else if (solution.$status === "rejected") { return 75; }
      else if (solution.$status === "accepted" || solution.$status === "paid_out") { return 100; }
      else { return 1; }
    };
  });


'use strict';

angular.module('app')
  .controller('Navbar', function ($scope, $api) {
    $scope.setEnv = $api.setEnvironment;
  })
  .controller('NavbarLinkedAccountSignin', function($scope, $location, $api) {
    $scope.save_route = function() {
      $api.set_post_auth_url($location.url());
    };
  });


'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/about', {
        redirectTo: "/learn",
        controller: 'Static'
      })
      .when('/account', {
        redirectTo: "/settings",
        controller: 'Static'
      })
      .when('/account/forgot_password', {
        redirectTo: "/signin/reset",
        controller: 'Static'
      })
      .when('/account/change_password', {
        redirectTo: "/settings/accounts",
        controller: 'Static'
      })
      .when('/projects', {
        redirectTo: "/tools",
        controller: 'Static'
      })
      .when('/users/:id', {
        redirectTo: function(param) { return "/people/"+param.id; },
        controller: 'Static'
      })
      .when('/trackers/:id/issues', {
        redirectTo: function(param) { return "/trackers/"+param.id; },
        controller: 'Static'
      })
      .when('/issues/:issue_id/bounties/:id/receipt', {
        redirectTo: function() { return "/activity/bounties"; },
        controller: 'Static'
      })
      .when('/issues/:issue_id/solutions/:id/disputes/create', {
        redirectTo: function(param) { return "/issues/"+param.issue_id+"/solutions"; },
        controller: 'Static'
      })
      .when('/issues/:issue_id/solutions/:id/disputes', {
        redirectTo: function(param) { return "/issues/"+param.issue_id+"/solutions"; },
        controller: 'Static'
      })
      .when('/solutions', {
        redirectTo: "/activity/solutions",
        controller: 'Static'
      })
      .when('/solutions/:id', {
        redirectTo: function() { return "/activity/solutions"; },
        controller: 'Static'
      })
      .when('/contributions', {
        redirectTo: "/activity",
        controller: 'Static'
      })
      .when('/termsofservice', {
        redirectTo: "/terms",
        controller: 'Static'
      })
      .when('/privacypolicy', {
        redirectTo: "/privacy",
        controller: 'Static'
      })
      .when('/fundraisers/:id/edit/basic-info', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/edit"; },
        controller: 'Static'
      })
      .when('/fundraisers/:id/edit/description', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/edit"; },
        controller: 'Static'
      })
      .when('/fundraisers/:id/edit/description', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/edit"; },
        controller: 'Static'
      })
      .when('/fundraisers/:id/edit/rewards', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/edit"; },
        controller: 'Static'
      })
      .when('/fundraisers/:id/edit/funding', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/edit"; },
        controller: 'Static'
      })
      .when('/fundraisers/:id/edit/duration', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/edit"; },
        controller: 'Static'
      })
      .when('/account/fundraisers', {
        redirectTo: "/activity/fundraisers",
        controller: 'Static'
      })
      .when('/account/create_fundraiser', {
        redirectTo: "/fundraisers/new",
        controller: 'Static'
      })
      .when('/fundraisers/:fundraiser_id/pledges/:id', {
        redirectTo: function() { return "/activity/pledges"; },
        controller: 'Static'
      })
      .when('/fundraisers/:id/info', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/rewards"; },
        controller: 'Static'
      })
      .when('/undefined', {
        redirectTo: "/",
        controller: 'Static'
      })
      .when('/account/fundraisers/:id/basic_info', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/edit"; },
        controller: 'Static'
      })
      .when('/account/fundraisers/:id/description', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/edit"; },
        controller: 'Static'
      })
      .when('/account/fundraisers/:id/rewards', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/edit"; },
        controller: 'Static'
      })
      .when('/account/fundraisers/:id/funding', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/edit"; },
        controller: 'Static'
      })
      .when('/account/fundraisers/:id/duration', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/edit"; },
        controller: 'Static'
      })
      .when('/bounties', {
        redirectTo: "/",
        controller: 'Static'
      });
  });

'use strict';
if (document.location.host.match(/localhost/)) {
  (function(d,t) {
    var g=d.createElement(t),s=document.getElementsByTagName(t)[0];
    g.src='http://localhost:35729/livereload.js';
    s.parentNode.insertBefore(g,s);
  }(document,'script'));
}
'use strict';

angular.module('app')
  .controller('MainController', function ($scope, $location, $rootScope) {

    // this really doesn't belong here
    $scope.chatroom = {
      show: false,
      toggle: function() { $scope.chatroom.show = !$scope.chatroom.show; },
      nick: "Guest" + Math.ceil(Math.random() * 100000),
      url: "none",
      connect: function() { console.log($scope.chatroom.nick); $scope.chatroom.url = '/chat/?nick=' + $scope.chatroom.nick; }
    };

    $rootScope.$on('$viewContentLoaded', function() {
      $scope.no_container = $location.path() === '/';
    });
  });

'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/people/:id', {
        templateUrl: 'pages/people/activity.html',
        controller: 'PeopleShow'
      });
  })
  .controller('PeopleShow', function ($scope, $routeParams, $api) {
    $scope.person = $api.person_get($routeParams.id);

    $scope.timeline = $api.person_timeline_get($routeParams.id).then(function(response) {
      return response;
    });
  });


'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/people/:id/following', {
        templateUrl: 'pages/people/following.html',
        controller: 'PeopleFollowing'
      });
  })
  .controller('PeopleFollowing', function ($scope, $routeParams, $api) {
    $scope.person = $api.person_get($routeParams.id);

    $scope.timeline = $api.person_timeline_get($routeParams.id).then(function(response) {
      console.log(response);
      return response;
    });
  });


'use strict';

angular.module('app')
  .controller('PersonTabs', function($scope, $location, $routeParams) {
    $scope.tabs = [
      { name: 'Activity', url: '/people/' + $routeParams.id }
      //{ name: 'Following', url: '/people/' + $routeParams.id + '/following' }
    ];
    $scope.is_active = function(url) {
      return url === $location.path();
    };

  });

'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id/pledge', {
        templateUrl: 'pages/pledges/new.html',
        controller: 'FundraiserPledgeCreateController'
      });
  })

  .controller('FundraiserPledgeCreateController', function ($scope, $routeParams, $window, $location, $payment, $api) {
    $scope.pledge = {
      amount: parseInt($routeParams.amount, 10) || 100,
      anonymous: $routeParams.anonymous || false,
      payment_method: $routeParams.payment_method || "google",
      reward_id: parseInt($routeParams.reward_id, 10) || 0
    };

    $scope.fundraiser = $api.fundraiser_get($routeParams.id).then(function(response) {
      // add the base item number, with just fundraiser id
      $scope.pledge.base_item_number = 'fundraisers/'+response.id;
      $scope.pledge.item_number = $scope.pledge.base_item_number;

      // select reward to have the object cached. handled after this by set_reward(reward)
      $scope.selected_reward = null;
      for (var i=0; $scope.pledge.reward_id && i<response.rewards.length; i++) {
        if (response.rewards[i].id === $scope.pledge.reward_id) {
          $scope.selected_reward = response.rewards[i];
          break;
        }
      }

      // build the create payment method
      $scope.create_payment = function() {
        var base_url = $window.location.href.replace(/\/fundraisers.*$/,'');
        var payment_params = angular.copy($scope.pledge);

        payment_params.success_url = base_url + "/activity/pledges";
        payment_params.cancel_url = $window.location.href;

        $payment.process(payment_params, {
          error: function(response) { console.log("Payment Error:", response); },

          noauth: function() {
            $api.set_post_auth_url("/fundraisers/" + response.slug + "/pledge", payment_params);
            $location.url("/signin");
          }
        });
      };

      return response;
    });

    $scope.set_reward = function(reward) {
      $scope.selected_reward = reward;
      $scope.pledge.reward_id = reward.id || 0;

      // add reward item to item number
      $scope.pledge.item_number = $scope.pledge.base_item_number + (reward.id === 0 ? '' : '/'+reward.id);

      // if the reward amount is higher than current pledge amount, raise it.
      if (reward.amount && (!$scope.pledge.amount || $scope.pledge.amount < reward.amount)) {
        $scope.pledge.amount = reward.amount;
      }
    };
  });

'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id/pledges', {
        templateUrl: 'pages/pledges/index.html',
        controller: 'FundraiserPledgeController'
      });
  })

  .controller('FundraiserPledgeController', function ($scope, $routeParams, $api) {
    $scope.pledges = $api.fundraiser_pledges_get($routeParams.id).then(function(pledges) {
      // need to turn amounts into float so that it's sortable
      for (var i in pledges) { pledges[i].amount = parseFloat(pledges[i].amount); }
      return pledges;
    });

    $scope.sort_column = 'amount';
    $scope.sort_reverse = true;

    $scope.sort_by = function(col) {
      // if clicking this column again, then reverse the direction.
      if ($scope.sort_column === col) {
        $scope.sort_reverse = !$scope.sort_reverse;
      } else {
        $scope.sort_column = col;
      }
    };
  });

'use strict';
angular.module('app')
  .service('$payment', function ($rootScope, $location, $window, $log, $api, $cookieStore) {
    // currently only used for bounty and pledge creation.
    // $payment.create({ amount: 15, payment_method: 'google', ... }).process();
    this._default_options = {
      success: function (response) {
        console.log('Payment success', response);
      },
      error:   function (response) {
        console.log('Payment error', response);
      },
      noauth:  function (response) {
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
  });
'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/settings/accounts', {
        templateUrl: 'pages/settings/accounts.html',
        controller: 'AccountSettings',
        resolve: $person
      });
  })
  .controller('AccountSettings', function($scope, $api, $location) {
    $scope.set_post_auth_url = function() {
      $api.set_post_auth_url($location.url());
    };

    $scope.github_link = $api.signin_url_for('github');
    $scope.twitter_link = $api.signin_url_for('twitter');
    $scope.facebook_link = $api.signin_url_for('facebook');

    $scope.form_data = {};
    $scope.change_password = function() {
      $scope.error = $scope.success = null;

      var req = {
        current_password: $scope.form_data.current_password,
        new_password: $scope.form_data.new_password,
        password_confirmation: $scope.form_data.new_password
      };
      $api.change_password(req).then(function(response) {
        if (response.error) {
          $scope.error = response.error;
        } else {
          $scope.success = 'Successfully updated password!';
        }
      });
    };

  });


'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/settings/email', {
        templateUrl: 'pages/settings/email.html',
        controller: 'SettingsEmail',
        resolve: $person
      });
  })
  .controller('SettingsEmail', function($scope, $routeParams, $api) {
    $scope.form_data = {
      email: $scope.current_person.email,
      weekly_newsletter: !$scope.current_person.exclude_from_newsletter
    };

    $scope.submit = function() {
      $scope.error = $scope.success = null;

      var updates = { email: $scope.form_data.email, exclude_from_newsletter: !$scope.form_data.weekly_newsletter };
      $api.person_put(updates).then(function() {
        if ($scope.current_person.email === $scope.form_data.email) {
          $scope.success = 'Email settings updated!';
        } else {
          $scope.error = 'Unable to update email settings!';
        }
      });
    };

  });


'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    //console.log($person);
    $routeProvider
      .when('/settings', {
        templateUrl: 'pages/settings/profile.html',
        controller: 'Settings',
        resolve: $person
      });
  })
  .controller('Settings', function($scope, $routeParams, $api, $location) {
    $scope.form_data = {
      first_name: $scope.current_person.first_name,
      last_name: $scope.current_person.last_name,
      display_name: $scope.current_person.display_name,
      bio: $scope.current_person.bio,
      location: $scope.current_person.location,
      company: $scope.current_person.company,
      url: $scope.current_person.url,
      public_email: $scope.current_person.public_email
    };

    $scope.profile_pics = [
      ($scope.current_person.github_account||{}).avatar_url,
      ($scope.current_person.twitter_account||{}).avatar_url,
      ($scope.current_person.facebook_account||{}).avatar_url
    ];

    $scope.save = function() {
      console.log($scope.form_data);
      $api.person_put($scope.form_data).then(function() {
        $location.url('/people/' + $scope.current_person.slug);
      });
    };
  });


'use strict';

angular.module('app')
  .controller('SettingsTabs', function($scope, $location) {
    $scope.tabs = [
      { name: 'Profile', url: '/settings' },
      { name: 'Accounts', url: '/settings/accounts' },
      { name: 'Email', url: '/settings/email' }
    ];
    $scope.is_active = function(url) {
      return url === $location.path();
    };

  });

'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/signin/callback', {
        controller: 'SigninCallback',
        template: '{{ error || "Redirecting..." }}'
      });
  }).controller('SigninCallback', function($scope, $api, $routeParams, $location) {
    if ($routeParams.status === 'linked') {
      $api.signin_with_access_token($routeParams.access_token).then(function(response) {
        if (response === false) {
          $scope.error = "ERROR: Unexpected linked account response.";
        }
      });
    } else if ($routeParams.status === 'error_needs_account') {
      $location.path('/signin').search($routeParams).replace();
    } else if ($routeParams.status === 'error_already_linked') {
      $scope.error = "ERROR: Account already linked.";
      console.log('ERROR: ');
    } else if ($routeParams.status === 'unauthorized') {
      $scope.error = "ERROR: Unauthorized.";
    } else {
      $scope.error = "ERROR: Unknown status.";
    }
  });


// SCRATCHPAD: don't require a view
//angular.module('app')
//  .config(function ($routeProvider) {
//    $routeProvider
//      .when('/signin/callback', {
//        redirectTo: $injector.invoke(function (route, path, params, $scope, $api) {
//          console.log($.api);
//          console.log("OH HAI", params, $scope, $api);
//
//          //console.log($scope, $routeParams);
//          return '/????';
////
////          $scope.providers = [
////            { id: 'github', name: 'GitHub', image_url: 'images/favicon-github.png' },
////            { id: 'twitter', name: 'Twitter', image_url: 'images/favicon-twitter.png' },
////            { id: 'facebook', name: 'Facebook', image_url: 'images/favicon-facebook.png' }
////          ];
////
////          $scope.submit = function() {
////            $api.signin($scope.email, $scope.password);
////          };
////
////          $scope.signin_url_for = $api.signin_url_for;
////          $scope.signout = $api.signout;
//        }
//      });
//  });
//
//

'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/signin/reset', {
        templateUrl: 'pages/signin/reset.html',
        controller: 'Reset'
      });
  })
  .controller('Reset', function ($scope, $routeParams, $api) {
    $scope.form_data = {
      email: $routeParams.email,
      code: $routeParams.code
    };

    $scope.reset_password = function() {
      $scope.show_validations = true;
      $scope.error = null;

      if ($scope.form.$valid) {
        $api.reset_password($scope.form_data).then(function(response) {
          if (response.message === 'Password reset') {
            $api.signin({ email: $scope.form_data.email, password: $scope.form_data.new_password });
          } else {
            $scope.error = response.error || response.message;
          }
        });
      }
    };
  });



'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/signin', {
        templateUrl: 'pages/signin/signin.html',
        controller: 'Signin'
      });
  })
  .controller('Signin', function ($scope, $routeParams, $api) {
    // probably doesn't belong here... this is how navbar's "Sign Out" is wired
    $scope.signout = $api.signout;

    // these are global... used both on signin page and also in navbar dropdown
    $scope.providers = [
      { id: 'github', name: 'GitHub', image_url: 'images/favicon-github.png' },
      { id: 'twitter', name: 'Twitter', image_url: 'images/favicon-twitter.png' },
      { id: 'facebook', name: 'Facebook', image_url: 'images/favicon-facebook.png' }
    ];
    $scope.signin_url_for = $api.signin_url_for;

    // passed in with a linked account
    $scope.provider = $routeParams.provider;
    $scope.form_data = {
      email: $routeParams.email,
      account_link_id: $routeParams.account_link_id,
      first_name: $routeParams.first_name,
      last_name: $routeParams.last_name,
      display_name: $routeParams.display_name,
      avatar_url: $routeParams.avatar_url,
      terms: false
    };

    // this tracks form state
    //   null == don't show errors yet
    //   'pending' == user typed email and blurred it
    //   'signin' == email checked and exists
    //   'signup' == email checked and available
    $scope.signin_or_signup = null;

    // don't show initial validations until form has been submitted
    $scope.show_validations = false;


    $scope.email_changing = function() {
      $scope.signin_or_signup = null;
    };

    $scope.email_changed = function() {
      if ($scope.email_previous !== $scope.form_data.email) {
        $scope.email_previous = $scope.form_data.email;
        $scope.signin_or_signup = 'pending';
        $api.check_email_address($scope.form_data.email).then(function(response) {
          if (response.email_is_registered) {
            $scope.signin_or_signup = 'signin';
          } else {
            $scope.signin_or_signup = 'signup';
          }
        });
      }
    };

    // if it was passsed in with query params, kick this off right away
    if ($scope.form_data.email) {
      $scope.email_changed();
    }

    // form submit
    $scope.signin = function() {
      if ($scope.signin_or_signup !== 'pending') {
        $scope.show_validations = true;
        $scope.error = null;
        $api.signin($scope.form_data).then(function(response) {
          if (response.error) {
            $scope.error = response.error;
          }
        });
      }
    };

    $scope.signup = function() {
      if ($scope.signin_or_signup !== 'pending') {
        $scope.show_validations = true;
        $scope.error = null;
        $api.signup($scope.form_data).then(function(response) {
          if (response.error) {
            $scope.error = response.error;
          }
        });
      }
    };

    $scope.forgot_password = function() {
      $api.request_password_reset({ email: $scope.form_data.email }).then(function(response) {
        $scope.error = response.message;
      });
    };

  });



'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/tools', {
        templateUrl: 'pages/tools/tools.html',
        controller: 'ToolsController',
        resolve: $person
      });
  })
  .controller('ToolsController', function ($scope, $routeParams, $window, $api) {
    $scope.selected_relation = null;

    $api.tracker_relations_get().then(function(relations) {
      $scope.relations = relations;
      $scope.init_relations($scope.relations);
    });

    $scope.init_relations = function(relations) {
      for (var i in relations) { $scope.init_relation(relations[i]); }
    };

    $scope.init_relation = function(relation) {
      relation.select = function() {
        $scope.selected_relation = relation;
        if (!$scope.hide_info) {
          $scope.hide_info = true;
        }

        // add flag set when waiting for plugin to be installed
        relation.$installing_plugin = false;

        // add install or update plugin method, depending on whether or not
        // plugin has been installed
        if (relation.project.tracker_plugin) {
          // add update method to tracker plugin
          $scope.init_tracker_plugin(relation);
        } else {
          relation.install_plugin = function() {
            relation.$installing_plugin = true;

            $api.tracker_plugin_create(relation.project.id, relation.linked_account.id).then(function(new_relation) {
              relation.$installing_plugin = false;

              if (new_relation.error) {
                // if error present, it means you lack permission to install the plugin.
                // set flag to hide install button
                relation.$hide_install_button = true;
                relation.$install_failed_error = new_relation.error;
              } else {
                // find and update the relation
                for (var i=0; i<$scope.relations.length; i++) {
                  if ($scope.relations[i].id === new_relation.id) {
                    for (var k in new_relation) { $scope.relations[i][k] = new_relation[k]; }
                    $scope.init_tracker_plugin($scope.relations[i]);
                    break;
                  }
                }
              }
            });
          };
        }

        // lastly, scroll to the top so that you can see the manage box
        $window.scrollTo(0,0);
      };
    };

    $scope.init_tracker_plugin = function(relation) {
      if (relation.project.tracker_plugin) {
        // create a master copy, for reverting changes
        relation.project.$tracker_plugin_master = angular.copy(relation.project.tracker_plugin);

        relation.project.tracker_plugin.close = function() {
          $scope.selected_relation = null;
          $scope.hide_info = false;
        };

        relation.project.tracker_plugin.update = function() {
          $api.tracker_plugin_update(relation.project.id, relation.project.tracker_plugin).then(function(updated_relation) {
            $scope.tracker_plugin_alert = { type: "success", message: ("Saved plugin options for "+relation.project.name) };

            relation.project.$tracker_plugin_master = angular.copy(updated_relation.project.tracker_plugin);
            for (var k in updated_relation) {
              relation.project.$tracker_plugin_master[k] = updated_relation[k];
            }
            relation.project.tracker_plugin.close();
          });
        };

        relation.project.tracker_plugin.reset = function() {
          for (var k in relation.project.$tracker_plugin_master) {
            relation.project.tracker_plugin[k] = relation.project.$tracker_plugin_master[k];
          }
        };

        relation.project.tracker_plugin.is_changed = function() {
          return angular.equals(relation.project.tracker_plugin, relation.project.$tracker_plugin_master);
        };
      }
    };

    $scope.relations_order = function(relation) {
      if (relation.type === 'owner') { return 2; }
      if (!angular.isUndefined(relation.type)) { return 1; }
      return 0;
    };

    $scope.filter_options = {
      text: null,
      only_with_plugin: false
    };

    $scope.relations_filter = function(relation) {
      var filter_it = false;
      if ($scope.filter_options.text) {
        var regexp = new RegExp(".*?"+$scope.filter_options.text+".*?", "i");
        filter_it = filter_it || !(regexp.test(relation.project.name) || regexp.test(relation.project.full_name));
      }
      if ($scope.filter_options.only_with_plugin) {
        filter_it = filter_it || !relation.project.tracker_plugin;
      }
      return !filter_it;
    };
  });



'use strict';

angular.module('app').controller('TrackerNavTabsController', function ($scope, $routeParams, $api) {
    $scope.active_tab = function() {
      // todo
      console.log($routeParams, $api);
    };
  });


'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/trackers/:id', {
        templateUrl: 'pages/trackers/show.html',
        controller: 'TrackerShow'
      });
  })
  .controller('TrackerShow', function ($scope, $routeParams, $location, $api) {
    $scope.issue_filter_options = {
      text: null,
      bounty_min: null,
      bounty_max: null,
      only_valuable: false,
      hide_closed: false,
      hide_open: false
    };

    $scope.order_col = "bounty_total";
    $scope.order_reverse = true;

    $scope.init_tags = function(tracker) {
      for (var i in tracker.tags) { $scope.init_tag(tracker, tracker.tags[i]); }
    };
    $api.tracker_get($routeParams.id).then(function(tracker) {
      $scope.init_tags(tracker);

      // follow and unfollow API method wrappers
      tracker.follow = function() {
        if (!$scope.current_person) { return $api.require_signin(); }

        if (tracker.followed) {
          $api.tracker_unfollow($scope.tracker.id).then(function() {
            // assume API call success, update the button state (tracker.followed)
            tracker.followed = false;
          });
        } else {
          $api.tracker_follow($scope.tracker.id).then(function() {
            // assume API call success, update the button state (tracker.followed)
            tracker.followed = true;
          });
        }
      };

      // model to create a new tag
      tracker.new_tag = { name: null };

      // method to create new tags
      tracker.create_tag = function() {
        if (!$scope.current_person) { return $api.require_signin(); }
        $api.tracker_tags_create(tracker.id, tracker.new_tag.name).then(function(new_tag_relation) {
          // only push it if it doesn't exist
          var push_it_real_good = true;
          for (var i=0; i<tracker.tags.length; i++) {
            if (tracker.tags[i].id === new_tag_relation.id) {
              push_it_real_good = false;
            }
          }
          if (push_it_real_good) {
            $scope.init_tag(tracker, new_tag_relation);
            tracker.tags.push(new_tag_relation);
          }

          // null out the model
          tracker.new_tag.name = null;
        });
      };

      $scope.tracker = tracker;
    });

<<<<<<< HEAD
=======
    // merge all of the issue arrays into one
    $scope.issues = $api.tracker_issues_get($routeParams.id).then(function(issues) {
      for (var i=0; i<issues.length; i++) { issues[i].bounty_total = parseFloat(issues[i].bounty_total); }
      return issues;
    });

    $scope.issue_filter_options = {
      text: null,
      bounty_min: null,
      bounty_max: null,
      only_valuable: false,
      hide_closed: false,
      hide_open: false
    };
>>>>>>> upstream/bootstrap-angular

    $scope.update_filter_options = function() {
      $scope.issue_filter_options.bounty_min = parseFloat($scope.issue_filter_options.bounty_min);
      $scope.issue_filter_options.bounty_max = parseFloat($scope.issue_filter_options.bounty_max);
    };

    $scope.issue_filter = function(issue) {
      var bounty_total = parseFloat(issue.bounty_total);
      var bounty_min = parseFloat($scope.issue_filter_options.bounty_min);
      var bounty_max = parseFloat($scope.issue_filter_options.bounty_max);

      if (!isNaN(bounty_min) && bounty_total < bounty_min) {
        return false;
      }
      if (!isNaN(bounty_max) && bounty_total > bounty_max) {
        return false;
      }
      if ($scope.issue_filter_options.only_valuable && bounty_total <= 0) {
        return false;
      }
      if ($scope.issue_filter_options.hide_closed && $scope.issue_filter_options.hide_open) {
        return false;
      }
      if ($scope.issue_filter_options.hide_closed) {
        return issue.can_add_bounty;
      }
      if ($scope.issue_filter_options.hide_open) {
        return !issue.can_add_bounty;
      }
      if ($scope.issue_filter_options.text) {
        var regexp = new RegExp(".*?"+$scope.issue_filter_options.text+".*?", "i");
        return regexp.test(issue.title) || (issue.number && issue.number.toString() === $scope.issue_filter_options.text) ;
      }

      return true;
    };

    $scope.change_order_col = function(col) {
      if ($scope.order_col === col) {
        $scope.order_reverse = !$scope.order_reverse;
      } else {
        $scope.order_reverse = true;
        $scope.order_col = col;
      }
    };


    $scope.init_tag = function(tracker, tag_relation) {
      tag_relation.upvote = function() {
        if (!$scope.current_person) { return $api.require_signin(); }
        $api.tracker_tags_upvote(tracker.id, tag_relation.tag.name).then(function(updated_tag_relation) {
          update_tracker_relation(tracker, updated_tag_relation);
        });
      };

      tag_relation.downvote = function() {
        if (!$scope.current_person) { return $api.require_signin(); }
        $api.tracker_tags_downvote(tracker.id, tag_relation.tag.name).then(function(updated_tag_relation) {
          update_tracker_relation(tracker, updated_tag_relation);
        });
      };

      var update_tracker_relation = function(tracker, updated_relation) {
        // find the tracker relation on the tracker array, then update it's attributes
        for (var i=0; i<tracker.tags.length; i++) {
          if (tracker.tags[i].id === updated_relation.id) {
            for (var k in updated_relation) { tracker.tags[i][k] = updated_relation[k]; }
            break;
          }
        }
      };
    };

    // override the filter and sort settings to only show open bounties
    $scope.show_bounties = function() {
      $scope.order_col = "amount";
      $scope.issue_filter_options = { only_valuable: true };
    };
  });

angular.module("app").run(["$templateCache", function($templateCache) {

  $templateCache.put("pages/about/faq.html",
    "<h1>Frequently Asked Questions</h1>\n" +
    "\n" +
    "<div id=\"split-main\">\n" +
    "  <div id=\"faq\">\n" +
    "    <span id=\"general\"></span>\n" +
    "\n" +
    "    <h2>General</h2>\n" +
    "    <dl>\n" +
    "      <dt>What types of projects are allowed on Bountysource?</dt>\n" +
    "      <dd>Any type of Open-Source or Free Software (as in speech) projects are allowed. Generally speaking, any software\n" +
    "        licenses approved by either the Open Source Initiative or the Free Software Foundation are acceptable. For a\n" +
    "        full list of OSI-approved licenses, please see <a target=\"_blank\" href=\"http://opensource.org/licenses/alphabetical\">http://opensource.org/licenses/alphabetical</a>.\n" +
    "        For a full list of GNU licenses, please see <a target=\"_blank\" href=\"http://www.gnu.org/licenses/\">http://www.gnu.org/licenses/</a>.\n" +
    "      </dd>\n" +
    "      <dt>You mentioned Free Software. How is that different from Open-Source?</dt>\n" +
    "      <dd>Free Software and Open-Source software are, generally speaking, two sides of the same coin. Both can be\n" +
    "        considered separate movements within the same community, but with varying goals. We suggest you read up on both\n" +
    "        sides yourself to better understand them.\n" +
    "      </dd>\n" +
    "\n" +
    "      <dd>\n" +
    "        <ol>\n" +
    "          <li>\"Free Software\": <a target=\"_blank\" href=\"http://www.gnu.org/philosophy/open-source-misses-the-point.html\">http://www.gnu.org/philosophy/open-source-misses-the-point.html</a>\n" +
    "          </li>\n" +
    "          <li>\"Open-Source\": <a target=\"_blank\" href=\"http://opensource.org/faq#free-software\">http://opensource.org/faq#free-software</a>\n" +
    "          </li>\n" +
    "        </ol>\n" +
    "      </dd>\n" +
    "\n" +
    "      <dt>How does Bountysource work?</dt>\n" +
    "      <dd>There are two main functions: Fundraisers and Bounties.</dd>\n" +
    "      <dd><i>How Bounties work:</i></dd>\n" +
    "      <dd>\n" +
    "        <ol>\n" +
    "          <li>Users fund bounties on open issues or feature requests they want to see addressed.</li>\n" +
    "          <li>These users spread the word about the bounty, enticing developers to create a solution.</li>\n" +
    "          <li>Developers create solutions and submit them on Bountysource.</li>\n" +
    "          <li>Bountysource tracks these solutions, sees which one gets accepted by the open-source project, and then\n" +
    "            pays the bounty to the developer.\n" +
    "          </li>\n" +
    "        </ol>\n" +
    "      </dd>\n" +
    "      <dd><i>How Fundraisers work:</i></dd>\n" +
    "      <dd>\n" +
    "        <ol>\n" +
    "          <li>Anyone can come to Bountysource and create a Fundraiser. Open-source fundraisers are typically used to\n" +
    "            raise money for new projects, big updates to existing projects, or to raise money for bounties.\n" +
    "          </li>\n" +
    "          <li>The Fundraiser creator spreads the word about the Fundraiser to their communities.</li>\n" +
    "          <li>Anyone can come to Bountysource and make pledges to a Fundraiser, helping it reach its funding goal in\n" +
    "            time.\n" +
    "          </li>\n" +
    "        </ol>\n" +
    "      </dd>\n" +
    "\n" +
    "      <dt>What makes Fundraisers different from Kickstarter, Indiegogo, etc?</dt>\n" +
    "      <dd>Several things:</dd>\n" +
    "      <dd>\n" +
    "        <ul>\n" +
    "          <li>We're focused entirely on open-source software, so our user base is more valuable in that sense.\n" +
    "            Bountysource users are familiar with the open-source community and projects; there's a higher chance of\n" +
    "            gaining contributions upon discovery as opposed to crowdfunding sites that cater to all types of projects.\n" +
    "          </li>\n" +
    "          <li>We offer reward fulfillment for physical goods - from creation to delivery. If you're interested in\n" +
    "            starting a Fundraiser and want shirts, stickers, thumbdrives, or more please <a href=\"mailto:support@bountysource.com\">contact us</a> for more details!\n" +
    "          </li>\n" +
    "          <li>Users have a direct line of communication with the team - no hoops to jump through, you can find the\n" +
    "            entire team on <a href=\"irc://irc.freenode.net/bountysource\">IRC (#bountysource on Freenode)</a>.\n" +
    "          </li>\n" +
    "          <li><a target=\"_blank\" href=\"https://github.com/bountysource/frontend\">Our front-end is open-source</a>! See\n" +
    "            things you don't like? Feel free to make changes and submit the code to us for review.\n" +
    "          </li>\n" +
    "        </ul>\n" +
    "      </dd>\n" +
    "      <dt>Why should I use Bountysource?</dt>\n" +
    "      <dd>There are several benefits to using Bountysource:\n" +
    "        <ul>\n" +
    "          <li><u>Increase development.</u> Encourage developers to submit quality pull requests more frequently by\n" +
    "            creating bounties on existing issues.\n" +
    "          </li>\n" +
    "          <li><u>Close issues faster.</u> Incentivize unpopular but necessary issues by adding higher bounties on them.\n" +
    "          </li>\n" +
    "          <li><u>Earn money.</u> Create solutions to open issues and collect bounties within any project (including your\n" +
    "            own).\n" +
    "          </li>\n" +
    "        </ul>\n" +
    "      </dd>\n" +
    "      <dt>I'm an admin/manager/committer on a project. What's my role in all of this?</dt>\n" +
    "      <dd>The more developers there are working on issues within your project, the more code/solutions you will receive.\n" +
    "        You don't need to do anything out of the ordinary - just let your community know about the bounties, check for\n" +
    "        and merge code as normal, and we take care of the rest.\n" +
    "      </dd>\n" +
    "      <dt>I'm worried about introducing money into my community.</dt>\n" +
    "      <dd>This is a valid and common hesitation. However, one of the main points of open-source software and making code\n" +
    "        public is to foster improvement. Regardless of someone's motivations, if quality code is being contributed to a\n" +
    "        project - due to a bounty or otherwise - there shouldn't be any issues.\n" +
    "      </dd>\n" +
    "    </dl>\n" +
    "\n" +
    "    <br>\n" +
    "\n" +
    "    <span id=\"bounties\"></span>\n" +
    "\n" +
    "    <h2>Bounties</h2>\n" +
    "    <dl>\n" +
    "      <dt>What is a bounty?</dt>\n" +
    "      <dd>A bounty is money offered as a reward for successfully resolving an issue within an open-source project.</dd>\n" +
    "      <dt>Who can create a bounty?</dt>\n" +
    "      <dd>Anybody with a Google Wallet or PayPal account. We plan to support other payment methods (such as Bitcoins) if\n" +
    "        there's demand for it!\n" +
    "      </dd>\n" +
    "      <dt>What can I put bounties on?</dt>\n" +
    "      <dd>You can create bounties on any open issue within any open-source project.</dd>\n" +
    "      <dt>What does it cost to post a bounty?</dt>\n" +
    "      <dd>Bountysource charges a 10% non-refundable fee for placing bounties in addition to the specific bounty amount.\n" +
    "        For example, to place a $50 bounty, you will be charged a total of $55.\n" +
    "      </dd>\n" +
    "      <dd>You will be required to pay the full amount of the bounty in order for the bounty to show up on\n" +
    "        Bountysource.\n" +
    "      </dd>\n" +
    "      <dt>Does 100% of the bounty go to the developer?</dt>\n" +
    "      <dd>Yes. The developer who solves the issue will receive the full bounty displayed.</dd>\n" +
    "      <dt>Who can claim a bounty?</dt>\n" +
    "      <dd>Anybody who submits an accepted solution to us.</dd>\n" +
    "      <dt>When is a solution considered accepted?</dt>\n" +
    "      <dd>When project committers/maintainers merge the solution into the project and close out the underlying issue.\n" +
    "      </dd>\n" +
    "      <dt>What does it cost to claim a bounty?</dt>\n" +
    "      <dd>Nothing. The amount displayed as the bounty total is the exact amount a developer will receive upon payout.\n" +
    "      </dd>\n" +
    "      <dt>Can several people put bounties on the same issue?</dt>\n" +
    "      <dd>Yes! That is ideal. A $50 bounty from 1 person might not be appealing, but a $2,000 bounty from 25 people\n" +
    "        might be.\n" +
    "      </dd>\n" +
    "      <dt>What happens after I post a bounty?</dt>\n" +
    "      <dd>We'll let you know when a solution is accepted for an issue you've backed. At that point, you will have two\n" +
    "        weeks to verify that it does what you want it to before we pay the developer.\n" +
    "      </dd>\n" +
    "      <dt>How can I keep track of all the bounties I've posted?</dt>\n" +
    "      <dd>You can view all of the issues you've backed via your <a target=\"_blank\" href=\"https://www.bountysource.com/#contributions\">Contributions\n" +
    "        page</a>.\n" +
    "      </dd>\n" +
    "      <dt>What if I'm unsatisfied with the solution to an issue I've backed?</dt>\n" +
    "      <dd>After a solution is accepted, you will have two weeks to open any disputes you may have.</dd>\n" +
    "      <dd>If you feel that an accepted solution does not meet the criteria of the issue, please email us at <a href=\"mailto:support@bountysource.com?subject=Dispute\">support@bountysource.com</a>.\n" +
    "      </dd>\n" +
    "      <dt>An issue I've backed has been closed. When will the solution be made available to the public?</dt>\n" +
    "      <dd>We have no control over when a project makes a new release. We award a bounty once code has been merged into\n" +
    "        the project. The rest is up to project owners and committers.\n" +
    "      </dd>\n" +
    "      <dt>What happens if an issue I've backed is closed without a solution?</dt>\n" +
    "      <dd>If an issue with bounties is closed without a solution, all backers are refunded.</dd>\n" +
    "      <dt>How do you know a project committer will accept any pull requests at all?</dt>\n" +
    "      <dd>We don't guarantee this, but one of the main points of open-source software and making code public is to\n" +
    "        foster improvement. Committers are always monitoring pull requests, and they likely will accept any and all code\n" +
    "        they feel is of quality.\n" +
    "      </dd>\n" +
    "      <dt>How do I know if my solution has been accepted or rejected?</dt>\n" +
    "      <dd>You can check on the status of your solutions via your <a target=\"_blank\" href=\"https://www.bountysource.com/#solutions\">Solutions\n" +
    "        page</a>.\n" +
    "      </dd>\n" +
    "      <dt>My solution was accepted. When do I get paid?</dt>\n" +
    "      <dd>Once a solution is accepted, it enters a two-week dispute period. If there are no outstanding disputes, you\n" +
    "        get paid after this period.\n" +
    "      </dd>\n" +
    "      <dt>How do I receive payment?</dt>\n" +
    "      <dd>You can receive payment via Google Wallet, Paypal, or a physical check.</dd>\n" +
    "      <dt>Do I have to pay taxes on bounties I collect?</dt>\n" +
    "      <dd>If you are in the United States and payments made to you are more than $600 for the year, we are required to\n" +
    "        issue you a Form 1099 to report the payments, which will require you to complete a Form W-9. You should consult\n" +
    "        your tax advisor as to the taxability of the payments.\n" +
    "      </dd>\n" +
    "    </dl>\n" +
    "    <br><span id=\"fundraisers\"></span>\n" +
    "\n" +
    "    <h2>Fundraisers</h2>\n" +
    "    <dl>\n" +
    "      <dt>What is a Fundraiser?</dt>\n" +
    "      <dd>A means of collecting monetary contributions for a specific goal. In particular, Bountysource Fundraisers are\n" +
    "        primarily used to raise money for new projects, new versions of existing projects, or for bounties.\n" +
    "      </dd>\n" +
    "      <dt>Who can create a fundraiser?</dt>\n" +
    "      <dd>Anybody!</dd>\n" +
    "      <dt>What does it cost to start a fundraiser?</dt>\n" +
    "      <dd>Nothing! Go <a target=\"_blank\" href=\"https://www.bountysource.com/#account/create_fundraiser\">start one</a>\n" +
    "        today.\n" +
    "      </dd>\n" +
    "      <dt>Are there fees charged at the end of a fundraiser?</dt>\n" +
    "      <dd>Yes. There is a 10% fee on all pledges. If a fundraiser meets its goal, the fee is deducted from the amount\n" +
    "        raised. If unsuccessful, the fee is deducted from each backer's refund.\n" +
    "      </dd>\n" +
    "      <dt>When do I get paid?</dt>\n" +
    "      <dd>We usually make two payouts - the first payout happens when the fundraiser meets its goal and the second\n" +
    "        payout happens when the fundraiser expires (for all additional pledges made).\n" +
    "      </dd>\n" +
    "    </dl>\n" +
    "    <br>\n" +
    "\n" +
    "    <p>Have any further questions? <a href=\"mailto:support@bountysource.com\">Contact us!</a></p></div>\n" +
    "</div>"
  );

  $templateCache.put("pages/about/fees.html",
    "<h1>Fees & Payments</h1>\n" +
    "\n" +
    "<h2>Fundraiser fees</h2>\n" +
    "<h3>Creating a Fundraiser</h3>\n" +
    "<p>We do not charge anything to create a Fundraiser. <a href=\"/fundraisers/new\">Go create one now!</a></p>\n" +
    "\n" +
    "<h3>Flexible Funding vs. All-or-nothing</h3>\n" +
    "<p>By default, all Fundraisers utilize a “Flexible Funding” model. This means that a developer will receive all money pledged to the Fundraiser even if the goal is not met.</p>\n" +
    "<p>However, developers can opt-in to an “All-or-nothing” campaign. In this model, a developer only receives the money pledged if the goal is met. Otherwise, all backers are refunded.</p>\n" +
    "<p>Read “When should I choose All-or-nothing?” in our FAQ for more information.</p>\n" +
    "\n" +
    "<h3>Fundraiser payout</h3>\n" +
    "<p>A 10% fee is deducted from the amount raised. This fee includes the payment processing fees incurred for collecting pledges. There are no other fees or charges from Bountysource.</p>\n" +
    "\n" +
    "<h3>Backing a Fundraiser</h3>\n" +
    "<p>You will be charged the exact amount you pledge the moment you make your pledge.</p>\n" +
    "<p>In the case of an “All-or-nothing” Fundraiser that fails to hit its goal, you will be refunded the pledged amount less a 10% fee.</p>\n" +
    "\n" +
    "<br>\n" +
    "<h2>Bounty fees</h2>\n" +
    "<h3>Claiming a bounty</h3>\n" +
    "<p>We do not charge anything to claim a bounty. The amount displayed as the bounty total is the exact amount a developer will receive upon payout.</p>\n" +
    "\n" +
    "<h3>Placing a bounty</h3>\n" +
    "<p>Bountysource charges a 10% non-refundable fee for placing bounties in addition to the specified bounty amount.</p>\n" +
    "<p>For example, to place a $1,000 bounty on an issue, you will be charged $1,100.</p>\n" +
    "\n" +
    "<br>\n" +
    "<h2>Payments</h2>\n" +
    "<h3>“Payout” vs. “Cashout”</h3>\n" +
    "<p>A Payout is a transfer of money from Bountysource to a Bountysource account.</p>\n" +
    "<p>A Cashout is a withdrawal of your Bountysource balance. All cashouts are processed on a per-request basis. We can send you money via Paypal, Google Wallet, physical check or bank wire. Bountysource is not responsible for any fees incurred due to the chosen cashout method.</p>\n" +
    "<p>To request a cashout of your current Bountysource balance, please use contact us. Cashouts happen on the Friday following a request.</p>\n" +
    "\n" +
    "<h3>Bounties</h3>\n" +
    "<p>Bounties are automatically paid out to a developer’s Bountysource account once their solution is accepted and merged.</p>\n" +
    "<p>You can request a cashout.</p>\n" +
    "\n" +
    "<h3>Fundraisers</h3>\n" +
    "<h4>All-or-Nothing:</h4>\n" +
    "<p>Pledges are paid out to a developer’s Bountysource account as soon as the fundraiser breaches its funding goal. If the fundraiser raises more than its funding goal, a second payout occurs at the end of the fundraiser.</p>\n" +
    "<p>You can request a cashout using (this form).</p>\n" +
    "\n" +
    "<h4>Flexible Funding</h4>\n" +
    "<p>Payouts occur on a per-request basis. You can request that we deposit the current fundraiser balance into your Bountysource account with (this form). Payout will happen on the Friday following your request.</p>\n" +
    "<p>Similarly, once the money is in your Bountysource account, you can request a cashout.</p>"
  );

  $templateCache.put("pages/about/history.html",
    "<h1>The History of Bountysource!</h1>"
  );

  $templateCache.put("pages/about/jobs.html",
    "<h1>Jobs</h1>\n" +
    "<p>Bountysource is a fast-growing startup that is constantly on hunt for top talent. If you don’t see an opening here that suits you but you feel like you should be a part of our team, <a href=\"mailto:jobs@bountysource.com\">contact us</a> anyway and tell us why we should hire you.</p>\n" +
    "<p>Bountysource is located in the Financial District of San Francisco (3rd & Market) with easy access to BART and MUNI.</p>\n" +
    "<p>To apply to any of these positions, please drop us a line at jobs@bountysource.com. Resumes and cover letters are important, but so are GitHub profiles and open-source contributions.</p>\n" +
    "\n" +
    "<p>Current Openings:</p>\n" +
    "\n" +
    "<h3>Senior Ruby on Rails Engineer</h3>\n" +
    "<div>\n" +
    "  <p>Please <a href=\"mailto:jobs@bountysource.com\">contact us</a> for more information about this position.</p>\n" +
    "</div>\n" +
    "\n" +
    "<h3>Marketing Director</h3>\n" +
    "<div>\n" +
    "  <p>Please <a href=\"mailto:jobs@bountysource.com\">contact us</a> for more information about this position.</p>\n" +
    "</div>\n" +
    "\n" +
    "<h3>Technical Intern</h3>\n" +
    "<div>\n" +
    "  <p>We are seeking a Technical intern to assist in a variety of daily tasks.</p>\n" +
    "  <p>Duties may include:</p>\n" +
    "  <ul>\n" +
    "    <li>Data mining / analysis of open source projects</li>\n" +
    "    <li>Generating reports on user activity</li>\n" +
    "    <li>Quality Assurance testing & feedback</li>\n" +
    "    <li>Assisting in outreach efforts</li>\n" +
    "  </ul>\n" +
    "  <p>We are looking for an individual who possesses the following:</p>\n" +
    "  <ul>\n" +
    "    <li>Passion for open-source software development</li>\n" +
    "    <li>Good communication skills. We are a small team and thrive on communication.</li>\n" +
    "    <li>No fear of getting hands dirty -- there will be opportunities to create and manage your own scripts, contribute to our front end, and add features to our admin.</li>\n" +
    "  </ul>\n" +
    "  <p>Pluses:</p>\n" +
    "  <ul>\n" +
    "    <li>You’ve already made a few Pull Requests on our front end</li>\n" +
    "    <li>Intimate knowledge of GitHub</li>\n" +
    "    <li>Existing contributor to open source software</li>\n" +
    "    <li>\n" +
    "      Experience with the following technologies:\n" +
    "      <ul>\n" +
    "        <li>Ruby on Rails</li>\n" +
    "        <li>JavaScript</li>\n" +
    "        <li>Angular.js</li>\n" +
    "        <li>Twitter Bootstrap</li>\n" +
    "      </ul>\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "  <p>Based on performance and fit this position has strong potential to grow into a permanent position. This is a paid internship.</p>\n" +
    "</div>"
  );

  $templateCache.put("pages/about/learn.html",
    "<div class=\"learn\">\n" +
    "  <!--<div>-->\n" +
    "  <!--<h1>How It Works</h1>-->\n" +
    "  <!--<p class=\"lead\">-->\n" +
    "  <!--&lt;!&ndash;Bountysource is the marketplace for <strong>spending</strong> money toward and <strong>earning</strong> money from open-source development.&ndash;&gt;\n" +
    "  -->\n" +
    "  <!--Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam eu tellus tortor. Suspendisse ornare scelerisque ante, ultrices interdum quam sollicitudin id. Donec nibh justo, sagittis sed metus et, porta viverra justo. Sed metus leo, porttitor quis nulla mollis, tempor pretium turpis.-->\n" +
    "  <!--</p>-->\n" +
    "  <!--</div>-->\n" +
    "\n" +
    "  <div class=\"row-fluid\">\n" +
    "    <div class=\"span6\">\n" +
    "      <div style=\"border-right: 3px solid #ccc; padding-right: 20px\">\n" +
    "        <h1>How Fundraisers Work</h1>\n" +
    "        <p class=\"lead\">Fundraisers are time-limited campaigns that allow open-source developers to raise money from their community.</p>\n" +
    "\n" +
    "        <h3><div class=\"big-circle-number\">1</div>Pitch your project.</h3>\n" +
    "        <div class=\"subtext\">\n" +
    "          <ul>\n" +
    "            <li>Describe what you want to do.</li>\n" +
    "            <li>Set a funding goal.</li>\n" +
    "            <li>Offer rewards to encourage pledges.</li>\n" +
    "          </ul>\n" +
    "        </div>\n" +
    "\n" +
    "        <h3><div class=\"big-circle-number\">2</div>Tap into the community.</h3>\n" +
    "        <div class=\"subtext\">\n" +
    "          <ul>\n" +
    "            <li>Tweet it. Blog it. Share it.</li>\n" +
    "            <li>Find corporate sponsors.</li>\n" +
    "            <li>Get featured on our homepage.</li>\n" +
    "          </ul>\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "        <h3><div class=\"big-circle-number\">3</div>Let us handle your rewards.</h3>\n" +
    "        <div class=\"subtext\">\n" +
    "          <p>We can even print and ship your t-shirts and stickers.</p>\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "        <div class=\"text-center\" style=\"padding-top: 30px\">\n" +
    "          <a class=\"btn btn-success btn-large\" href=\"/fundraisers/new\">Create a Fundraiser</a>\n" +
    "        </div>\n" +
    "\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"span6\">\n" +
    "      <h1>How Bounties Work</h1>\n" +
    "      <p class=\"lead\">Bounties are cash rewards on specific bugs or feature requests that encourage development.</p>\n" +
    "\n" +
    "      <h3><div class=\"big-circle-number\">1</div>Create a bounty.</h3>\n" +
    "      <div class=\"subtext\">\n" +
    "        <ul>\n" +
    "          <li>Get bugs fixed and new features added sooner.</li>\n" +
    "          <li>A little bit goes a long way with crowdfunding.</li>\n" +
    "          <li>Attract new developers and grow the community.</li>\n" +
    "        </ul>\n" +
    "        <!--<a class=\"btn btn-success\">Search for Issue</a>-->\n" +
    "      </div>\n" +
    "\n" +
    "      <h3><div class=\"big-circle-number\">2</div>Earn money by solving issues.</h3>\n" +
    "      <div class=\"subtext\">\n" +
    "        <ul>\n" +
    "          <li>Submit your pull request to the project.</li>\n" +
    "          <li>Let Bountysource know by creating a solution.</li>\n" +
    "          <li>Get paid when your code is merged.</li>\n" +
    "       </ul>\n" +
    "      </div>\n" +
    "\n" +
    "\n" +
    "      <h3><div class=\"big-circle-number\">3</div>GitHub, Trac, Bugzilla, and more.</h3>\n" +
    "      <div class=\"subtext\">\n" +
    "        <p>We integrate closely with all issues trackers.  Check out our <a href=\"/tools\">Tools</a>.</p>\n" +
    "        <!--<p>Developers can earn bounties by addressing issues your community wants resolved. At the same time, you are contributing to open-source software that will benefit everyone.</p>-->\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"text-center\" style=\"padding-top: 30px\">\n" +
    "        <a class=\"btn btn-success btn-large\" href=\"/search\">Search for Issues or Projects</a>\n" +
    "      </div>\n" +
    "\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );

  $templateCache.put("pages/about/privacy_policy.html",
    "<h1 class=\"text-center\">Bountysource</h1>\n" +
    "<h1 class=\"text-center\">Privacy Policy</h1>\n" +
    "<br>\n" +
    "\n" +
    "<p>Bountysource's Privacy Policy is designed to provide clarity about the information we collect and how we use it to\n" +
    "  provide a better experience. By using our Website or Services or agreeing to our Terms of Service, you consent to\n" +
    "  our collection, storage, use and disclosure of your personal information as described in this Privacy Policy.</p>\n" +
    "\n" +
    "<h2>1. Introduction</h2>\n" +
    "\n" +
    "<p>We provide the Bountysource services (the \"<b>Services</b>\") through our website at www.Bountysource.com and\n" +
    "  related websites (the \"<b>Websites</b>\"). This Privacy Policy describes:</p>\n" +
    "<ul>\n" +
    "  <li>the information we collect, how we do so and the purposes of our collection</li>\n" +
    "  <li>how we use and with whom we share such information</li>\n" +
    "  <li>how you can access and update such information</li>\n" +
    "  <li>the choices you can make about how we collect, use and share your information</li>\n" +
    "  <li>how we protect the information we store about you</li>\n" +
    "</ul>\n" +
    "<h2>2. Information We Collect</h2>\n" +
    "\n" +
    "<p>When you use our Services or Websites, we may collect information about you as described below:</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\"><b>2.1 Registration Information</b></p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">When you \"register\" with us, you may be required to provide the following information:\n" +
    "  your age or birthday (for age screening and/or to better understand who our users are); your first and last names;\n" +
    "  your e-mail address; your mailing address; a password and other information that helps us confirm that it is you\n" +
    "  accessing your account. We collect the information that you provide for purposes of enabling you to use our Service\n" +
    "  and Website.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">We may also offer you the option to complete a user profile that is visible to other\n" +
    "  Bountysource users. Your user profile may include: a profile photo; username(s); gender; biographic details that you\n" +
    "  provide; and links to your profiles on various social networks.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">Your first and last names and profile picture are considered \"public\" on Bountysource\n" +
    "  Websites. Please be aware that search engines may index this publicly available information. When we offer profiles,\n" +
    "  we will also offer functionality that allows you to opt-out of public indexing of your public profile\n" +
    "  information.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">We may also offer you the ability to import your address book or social network\n" +
    "  contacts or manually enter e-mail addresses so that you can (i) locate your contacts on Bountysource; and (ii)\n" +
    "  invite those contacts to join Bountysource. If you elect to use this feature, we will access or store those contacts\n" +
    "  for purposes of helping you and your contacts make connections on our Website. If you do not want your contacts\n" +
    "  accessed or stored, please do not use this feature of our Service. Passwords provided to Bountysource for the\n" +
    "  purpose of accessing your address book or social network contacts will not be stored.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\"><b>2.2 Payment Information</b></p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">If you make a payment to us, or if we make a payment to you, we will collect the credit\n" +
    "  card, billing, account and banking information needed to receive or send payments. This information may include your\n" +
    "  bank name, account number, credit card information, postal and e-mail addresses.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\"><b>2.3 Customer Support Correspondence</b></p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">When you ask for assistance from our Customer Support team, we will collect and store\n" +
    "  the contact information you provide (generally your name and e-mail address), information about your Services, and\n" +
    "  the reason for your inquiry. We will also store the correspondence to and from you about your inquiry.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\"><b>2.4 Technical and Usage Information</b></p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">When you access our Website or use our Services, we collect (i) certain technical\n" +
    "  information about your mobile device or computer system, including IP Address and mobile device ID; and (ii) usage\n" +
    "  statistics about your use of our Services. This information is typically collected through the use of server log\n" +
    "  files or web log files (\"<b>Log Files</b>\"), mobile device software development kits and tracking technologies like\n" +
    "  browser cookies. We collect this information to enable us to understand our user base better and to analyze certain\n" +
    "  types of technical information. For more information on how we utilize cookies and other tracking technologies\n" +
    "  please review the \"Cookies and Automated Information Collection\" portion of Section 3.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\"><b>2.5 Information About Issues, Solutions and Bounties</b></p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">To enable you to use our Website and Services, we also collect information about the\n" +
    "  Issues that are posted on our Service, the Solutions that are submitted through our Service, and the Bounties that\n" +
    "  are posted and paid via our Service. We associate information about Issues, Solutions and Bounties with particular\n" +
    "  users (e.g., Developers of a particular Solution, or Backers of a particular Issue).</p>\n" +
    "\n" +
    "<h2>3. How We Collect Information About You</h2>\n" +
    "\n" +
    "<p>We may collect information about you in any one or more of the following ways:</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\"><b>3.1 Information about Your Activity on our Websites and Services</b></p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">When you use our Services or Websites, we collect and store certain information that\n" +
    "  you provide directly or through a third party website that is offering our Services. To provide a better user\n" +
    "  experience, we also collect information about your interaction with other users and the Service. The bulk of this\n" +
    "  information is collected and stored through the use of Log Files, which are files on our web servers that record\n" +
    "  actions taken on our Website and Services.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\"><b>3.2 Communications Features</b></p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">You may be able to take part in certain activities on our Websites or Services that\n" +
    "  give you the opportunity to communicate or share information not just with Bountysource, but also with other users\n" +
    "  of our Services. These include:</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">\n" +
    "<ul>\n" +
    "  <li>posting information about a particular Issue or Solution</li>\n" +
    "  <li>participating in forums and message boards</li>\n" +
    "  <li>posting public comments to other users' profiles</li>\n" +
    "  <li>sending private messages or invitations to other users, either directly on our Website or to their e-mail\n" +
    "    accounts\n" +
    "  </li>\n" +
    "  <li>chat with other users</li>\n" +
    "  <li>posting photos</li>\n" +
    "</ul>\n" +
    "</p><p style=\"padding-left: 15px\">We may record and store archives of these communications on our servers to protect\n" +
    "the safety and well being of our users and our rights and property in connection with the Service. You acknowledge and\n" +
    "consent to the recording and storage of such communications for these purposes.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\"><b>3.3 Cookies and Automated Information Collection</b></p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">When you access our Websites and Services, we collect certain technical information in\n" +
    "  order to (i) analyze the usage of our Websites and Services; (ii) provide a more personalized experience; and (iii)\n" +
    "  manage advertising. We and service providers acting on our behalf, such as Google Analytics, use Log Files and\n" +
    "  tracking technologies to collect and analyze certain types of technical information, including cookies, IP\n" +
    "  addresses, device type, device identifiers, browser types, browser language, referring and exit pages, and URLs,\n" +
    "  platform type, the number of clicks, domain names, landing pages, pages viewed and the order of those pages, the\n" +
    "  amount of time spent on particular pages, and the date and time of activity on our Websites or Services, and other\n" +
    "  similar information.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">We may also employ other technologies including (i) web beacons, which allow us to know\n" +
    "  if a certain page was visited or whether an e-mail was opened; (ii) tracking pixels, which allow us to advertise\n" +
    "  more efficiently by excluding our current users from certain promotional messages, identifying the source of a new\n" +
    "  installation or delivering ads to you on other websites; and (iii) local shared objects also known as flash cookies,\n" +
    "  which help us to prevent fraud, remember your site preferences and speed up load times.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">You can set your web browser to warn you about attempts to place cookies on your\n" +
    "  computer or limit the type of cookies you allow. Flash cookies operate differently than browser cookies and cookie\n" +
    "  management tools available in a web browser may not remove flash cookies. To learn more about and manage flash\n" +
    "  cookies you can visit <a target=\"_blank\" href=\"http://helpx.adobe.com/flash-player/kb/disable-local-shared-objects-flash.html\">http://helpx.adobe.com/flash-player/kb/disable-local-shared-objects-flash.html</a>.\n" +
    "  If you disable cookies, you may lose some of the features and functionality of our Services, as Bountysource cookies\n" +
    "  are necessary to track and enhance your activities. Please note that companies delivering advertisements on our\n" +
    "  Websites may also use cookies or other technologies, and those practices are subject to their own policies.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\"><b>3.4 Other Sources</b></p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">We may collect or receive information about you from other sources including (i) other\n" +
    "  Bountysource users who choose to upload their email contacts; (ii) social networks (if you use these features of our\n" +
    "  Service); (iii) repositories such as GitHub; and (iv) third party information providers. This information will be\n" +
    "  used to supplement your profile, to help you and your contacts connect, to help manage and offer Service you\n" +
    "  request, and to offer you Services in which you may be interested. It may be combined with other information we\n" +
    "  collect.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\"><b>3.5 Repositories</b></p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">We may also collect or receive data and information about you from repositories (e.g.,\n" +
    "  GitHub). This information might include the date and time when you submitted a proposed Solution to a particular\n" +
    "  Issue. We collect this information to enable us to efficiently administer our Services.</p>\n" +
    "\n" +
    "<h2>4. How We Use the Information We Collect</h2>\n" +
    "\n" +
    "<p>In general, we collect, store and use your information to provide you with a safe, smooth, efficient, and\n" +
    "  customized experience. For example, we may use information collected from you in any one or more of the following\n" +
    "  ways:</p>\n" +
    "<ul>\n" +
    "  <li>to create your accounts and allow use of our Services</li>\n" +
    "  <li>to provide technical support and respond to user inquiries</li>\n" +
    "  <li>to prevent fraud or potentially illegal activities</li>\n" +
    "  <li>to enforce our Terms of Service</li>\n" +
    "  <li>to notify users of updates to our Services, Terms of Service, or other rules and policies</li>\n" +
    "  <li>to solicit input and feedback to improve our Services and customize your user experience</li>\n" +
    "  <li>to inform users about new Services or promotional offers</li>\n" +
    "  <li>to assist in resolving disputes and administering the use of our Services</li>\n" +
    "  <li>to engage in commonly accepted practices, such as contacting you at the email address we have on file if you are\n" +
    "    a potential winner in a contest or sweepstakes\n" +
    "  </li>\n" +
    "  <li>to identify and suggest connections with other Bountysource users</li>\n" +
    "  <li>to enable user-to-user communications</li>\n" +
    "  <li>to deliver and target advertising</li>\n" +
    "</ul>\n" +
    "<p>One important use of your information is communication. If you have provided your e-mail address to Bountysource,\n" +
    "  we'll use it to respond to (i) customer support inquiries, and (ii) keep you informed of your account activity. Some\n" +
    "  messages, such as invites for friends to join Bountysource, may include your name and profile photo. We may also\n" +
    "  send promotional e-mail messages and promotional SMS messages (\"<b>Promotional Communications</b>\") directly or in\n" +
    "  partnership with parties other than Bountysource. Each Promotional Communication will generally offer recipients\n" +
    "  choices about receiving additional messages.</p>\n" +
    "\n" +
    "<h2>5. Sharing of Your Information</h2>\n" +
    "\n" +
    "<p>We will share your information (in some cases personal information) with third parties, that is parties other than\n" +
    "  Bountysource, in the following circumstances:</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\"><b>5.1 Third Party Service Providers</b></p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">We will provide your information to third party companies to perform services on our\n" +
    "  behalf, including payment processing, data analysis, e-mail delivery, hosting services, customer service and to\n" +
    "  assist us in our marketing efforts. We direct all such third party service providers to maintain the confidentiality\n" +
    "  of the information disclosed to them and to not use your information for any purpose other than to provide services\n" +
    "  on Bountysource's behalf.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\"><b>5.2 Friends and Other Bountysource Users</b></p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">The Service supports and may encourage interaction among users. In most Bountysource\n" +
    "  Services your social networks friends will see your name, profile photo and descriptions of your activity. In many\n" +
    "  Bountysource Services friends and other users will be able to see your profile, which may include your name and your\n" +
    "  profile photo. Other users may also be able to send you communications through our or the related social networks’\n" +
    "  communication channels.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\"><b>5.3 Advertising of Third Party Products and Services</b></p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">We do not actively share personal information with third party advertisers for their\n" +
    "  direct marketing purposes unless you give us your consent. We may share (i) aggregated information (information\n" +
    "  about you and other users collectively, but not specifically identifiable to you); (ii) anonymous information; and\n" +
    "  (iii) certain technical information (including IP Addresses and mobile device IDs) to develop and deliver targeted\n" +
    "  advertising in the Service and on the websites of third parties. We may also allow advertisers to collect these\n" +
    "  types of information within the Service and they may share it with us. Advertisers may collect this information\n" +
    "  through the use of tracking technologies like browser cookies and web beacons. The information collected may be used\n" +
    "  to offer you targeted ad-selection and delivery in order to personalize your user experience by ensuring that\n" +
    "  advertisements for products and services you see will appeal to you, a practice known as behavioral advertising, and\n" +
    "  to undertake web analytics (i.e. to analyze traffic and other end user activity to improve your experience). To\n" +
    "  learn more about behavioral advertising or to opt-out of this type of advertising for participating ad networks, you\n" +
    "  can visit the <a target=\"_blank\" href=\"http://www.networkadvertising.org/managing/opt_out.asp\">Network Advertising\n" +
    "    Initiative</a> or the <a target=\"_blank\" href=\"http://www.aboutads.info/choices/\">Digital Advertising Alliance</a>.\n" +
    "</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\"><b>5.4 Safety, Security and Compliance with Law</b></p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">Your information, and the contents of all of your online communications (including\n" +
    "  without limitation IP addresses and your personal information) may be accessed and monitored as necessary to provide\n" +
    "  the Service and may be disclosed: (i) when we have a good faith belief that we are required to disclose the\n" +
    "  information in response to legal process (for example, a court order, search warrant or subpoena); (ii) to satisfy\n" +
    "  any applicable laws or regulations (iii) where we believe that the Service is being used in the commission of a\n" +
    "  crime, including to report such criminal activity or to exchange information with other companies and organizations\n" +
    "  for the purposes of fraud protection and credit risk reduction; (iv) when we have a good faith belief that there is\n" +
    "  an emergency that poses a threat to the health and/or safety of you, another person or the public generally; and (v)\n" +
    "  in order to protect our rights or property, including to enforce our <a target=\"_blank\" href=\"#termsofservice\">Terms\n" +
    "    of Service</a> or other agreements between you and us.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\"><b>5.5 Sale or Merger</b></p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">In the event that Bountysource undergoes a business transition, such as a merger,\n" +
    "  acquisition by another company, or sale of all or a portion of its assets, we may transfer all of your information,\n" +
    "  including personal information, to the successor organization in the transition.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\"><b>5.6 Affiliates</b></p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">As part of our Services, we may transfer data to or from our subsidiaries, parent\n" +
    "  companies, joint ventures and other corporate entities under common ownership (each an \"<b>Affiliate</b>\") from time\n" +
    "  to time for our legitimate business purposes. In such cases, your information may be transferred between us and our\n" +
    "  Affiliate to enable us or our Affiliate to provide our Services.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\"><b>5.7 Anonymous or Aggregated Information</b></p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">Our collection, use, and disclosure of anonymous or aggregated information are not\n" +
    "  subject to any of the restrictions in this Privacy Policy.</p>\n" +
    "\n" +
    "<h2>6. Our Policies Concerning Children</h2>\n" +
    "\n" +
    "<p>Our Websites and Services are not intended for children under the age of 13 and we do not knowingly collect any\n" +
    "  personal information from such children. Children under the age of 13 should not use our Websites or Services at any\n" +
    "  time. In the event that we learn that we have inadvertently gathered personal information from children under the\n" +
    "  age of 13, we will take reasonable measures to promptly erase such information from our records.</p>\n" +
    "\n" +
    "<h2>7. How to Access and Update Your Information</h2>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\"><b>7.1 Information We Receive From Social Networks</b></p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">To manage the information Bountysource receives about you from a social network where\n" +
    "  you use our Services, you will need to follow the instructions at that site for updating your information and\n" +
    "  changing your privacy settings. The privacy management tools for various sites are below. You can manage certain\n" +
    "  aspects of information collection and use by going to the settings of your (mobile) device and reviewing the\n" +
    "  permissions of each application.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">Facebook privacy information can be found <a target=\"_blank\" href=\"http://www.facebook.com/settings/?tab=privacy\">here</a>.\n" +
    "</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">Google+ privacy information can be found <a target=\"_blank\" href=\"https://plus.google.com/u/0/settings/privacy?hl=en&amp;tab=4\">here</a>.\n" +
    "</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">Twitter privacy information can be found <a target=\"_blank\" href=\"https://twitter.com/privacy\">here</a>.\n" +
    "</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">GitHub privacy information can be found <a target=\"_blank\" href=\"https://help.github.com/articles/github-privacy-policy\">here</a>.\n" +
    "</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">Once Bountysource receives your information from a social network, that information is\n" +
    "  stored and used by Bountysource in accordance with this Privacy Policy, and you may access and update that\n" +
    "  information as described below. Accounts created with Bountysource are considered active until we receive a user\n" +
    "  request to delete them or deactivate them.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\"><b>7.2 Other Methods of Accessing and Controlling your Information</b></p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">If you no longer want Bountysource to make active use of your information, you may send\n" +
    "  an e-mail to <a href=\"mailto:support@bountysource.com\">support@bountysource.com</a>. Place \"Delete My Account\" in\n" +
    "  the subject line and include your first name, last name, and e-mail address in the body of the e-mail. We will\n" +
    "  respond to your request within thirty (30) days. Please note that certain records, for example those pertaining to\n" +
    "  payments or customer service matters, will be retained for legal and accounting purposes. If you have sent or posted\n" +
    "  content on the Service, we may not be able to delete it.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">You may change your e-mail preferences at any time, by visiting your e-mail preference\n" +
    "  page in your online account.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">If you wish to review or change the information Bountysource has about you, or if you\n" +
    "  have additional questions about this Privacy Policy, contact us at <a href=\"mailto:support@bountysource.com\">support@bountysource.com</a>.\n" +
    "</p>\n" +
    "\n" +
    "<h2>8. Your Sharing and Messaging Options</h2>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\"><b>8.1 Opting Out of Promotional Communications</b></p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">You can choose to opt out of receiving additional promotional e-mails from Bountysource\n" +
    "  by clicking on the \"unsubscribe\" link in any such e-mail. Please note that once we receive your request, it may take\n" +
    "  an additional period of time for your opt-out to become effective. Your unsubscribe or e-mail preference change will\n" +
    "  be processed promptly, and in no event longer than 10 business days.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\"><b>8.2 Opting Out of Other Communications</b></p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">You can opt out of receiving SMS messages by texting STOP to the number we send from\n" +
    "  for that particular SMS program. When we receive an opt-out message from you for SMS messages, we may send a message\n" +
    "  confirming our receipt of your opt-out.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\"><b>8.3 Essential Communications</b></p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">Note that if you opt-out of our Promotional Communications or other forms of\n" +
    "  communication, we may still e-mail or communicate with you from time to time if we need to provide you with\n" +
    "  information or if we need to request information from you with respect to a transaction initiated by you or for\n" +
    "  other legitimate non-marketing reasons.</p>\n" +
    "\n" +
    "<h2>9. International Transfers</h2>\n" +
    "\n" +
    "<p>If you are visiting this website from a country other than the country in which our servers are located (the United\n" +
    "  States), your communications with us may result in the transfer of information across international boundaries. By\n" +
    "  visiting this website and communicating electronically with us, you consent to such transfers.</p>\n" +
    "\n" +
    "<h2>10. Privacy Policies of Linked Sites and Advertisers</h2>\n" +
    "\n" +
    "<p>Our Website and Services may contain site links or advertisements from companies other than Bountysource that may\n" +
    "  link to their own websites. For example, our Service works in conjunction with Repositories such as GitHub, but we\n" +
    "  are not affiliated with these Repositories in any legal or corporate sense. We are not responsible for the privacy\n" +
    "  practices or the content of such websites. If you have any questions about how these other websites use your\n" +
    "  information, you should review their policies and contact them directly.</p>\n" +
    "\n" +
    "<h2>11. Security of Your Information</h2>\n" +
    "\n" +
    "<p>Bountysource implements reasonable security measures to protect the security of your information both online and\n" +
    "  offline, and we are committed to the protection of customer information.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">11.1 User account information is protected by the password each member uses to access\n" +
    "  their online account. It is important that you protect and maintain the security of your account and that you\n" +
    "  immediately notify us of any unauthorized use of your account. If you forget the password to your Bountysource\n" +
    "  account, the Website allows you to request that instructions be sent to you that explain how to reset your password.\n" +
    "  When you sign into your account or enter payment information (such as a credit card number when purchasing virtual\n" +
    "  currency), we encrypt the transmission of that information using secure socket layer technology.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">11.2 While we take reasonable precautions against possible security breaches of our\n" +
    "  Websites and our customer databases and records, no website or Internet transmission is completely secure, and we\n" +
    "  cannot guarantee that unauthorized access, hacking, data loss, or other breaches will never occur. We urge you to\n" +
    "  take steps to keep your personal information safe (including your account password), and to log out of your account\n" +
    "  after use. If your social networks account is hacked, this may lead to unauthorized use of your Bountysource\n" +
    "  account, so be careful to keep your account information secure. If you have questions about the security of our\n" +
    "  Websites, please contact us at <a href=\"mailto:support@bountysource.com\">support@bountysource.com</a>.</p>\n" +
    "\n" +
    "<p style=\"padding-left: 15px\">11.3 Unfortunately, the transmission of information over the Internet is not completely\n" +
    "  secure. Although we strive to protect your personal data, we cannot guarantee the security of your data while it is\n" +
    "  being transmitted to our Website; any transmission is at your own risk. Once we have received your information, we\n" +
    "  have procedures and security features in place to try to prevent unauthorized access.</p>\n" +
    "\n" +
    "<h2>12. Changes to Our Privacy Policy</h2>\n" +
    "\n" +
    "<p>If we decide to make material changes to our Privacy Policy, we will notify you and other users by placing a notice\n" +
    "  on Bountysource.com or by sending you a notice to the e-mail address we have on file for you. We may supplement this\n" +
    "  process by placing notices in our Services and on other Bountysource Websites. You should periodically check <a target=\"_blank\" href=\"https://www.bountysource.com\">www.bountysource.com</a> and this privacy page for updates.\n" +
    "</p>\n" +
    "\n" +
    "<h2>13. Your California Privacy Rights</h2>\n" +
    "\n" +
    "<p>We do not share personal information with third parties for their direct marketing purposes unless you\n" +
    "  affirmatively agree to such disclosure, typically by \"opting in\" to receive information from a third party that is\n" +
    "  participating in a sweepstakes or other promotion on our Website. If you do ask us to share your personal\n" +
    "  information with a third party for its marketing purposes, we will only share information in connection with that\n" +
    "  specific promotion, as we do not share information with any third party (other than our service providers) on a\n" +
    "  continual basis. To prevent disclosure of your personal information for use in direct marketing by a third party, do\n" +
    "  not opt in to such use when you provide personal information on one of our Websites.</p>\n" +
    "\n" +
    "<p>Users in certain jurisdictions have a right to access personal information held about themselves. Your right of\n" +
    "  access can be exercised in accordance with applicable law. Please submit any requests for access to your personal\n" +
    "  data in writing to <a href=\"mailto:support@bountysource.com\">support@bountysource.com</a>.</p>\n" +
    "\n" +
    "<h2>14. Contact Us</h2>\n" +
    "\n" +
    "<p>If you have any questions, comments or concerns regarding our Privacy Policy and/or practices, please e-mail us at\n" +
    "  <a href=\"mailto:support@bountysource.com\">support@bountysource.com</a>.</p>\n" +
    "\n" +
    "<p>Bountysource Inc.<br>548 Market Street #40189, San Francisco, CA 94104-5401</p>\n" +
    "\n" +
    "<p><i>Effective Date of Revision: March 7, 2013</i></p>"
  );

  $templateCache.put("pages/about/terms.html",
    "<h1 class=\"text-center\">Bountysource</h1>\n" +
    "<h2 class=\"text-center\">Terms of Service</h2>\n" +
    "\n" +
    "<p>THIS IS A LEGALLY BINDING AGREEMENT between you and BountySource Inc. (\"<strong>Bountysource</strong>\", \"<strong>we</strong>\" or \"<strong>us</strong>\"). By using the Bountysource.com website (\"<strong>Site</strong>\") or any of the Bountysource services (\"<strong>Services</strong>\"), you agree to all the terms and conditions of this Terms of Service (\"<strong>Agreement</strong>\"). If you are entering into this Agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to these terms and conditions, in which case the terms \"you\" or \"your\" shall refer to such entity. If you do not have such authority, or if you do not agree with these terms and conditions, you must not proceed with the registration process or use our Site or Service.</p>\n" +
    "\n" +
    "<h3>1. Overview</h3>\n" +
    "<p>Bountysource is a platform for encouraging development in open-source projects by bringing together users and developers to solve existing development issues.   In this Agreement, the following terms have the following meanings:</p>\n" +
    "<ul>\n" +
    "  <li>\"<strong>Backers</strong>\" are users that pay Bountysource to contribute to Fundraisers or Bounties.</li>\n" +
    "  <li>\"<strong>Bounties</strong>\" are cash rewards that Bountysource pays to Developers who first develop a successful Solution to an Issue.</li>\n" +
    "  <li>\"<strong>Committers</strong>\" are persons that are authorized to merge code into a Repository on behalf of an open-source project.</li>\n" +
    "  <li>\"<strong>Developers</strong>\" are users that try to develop Solutions and claim a Bounty, or who receive funds from Fundraisers for a particular goal.</li>\n" +
    "  <li>\"<strong>Fundraisers</strong>\" are fundraising campaigns for a particular defined goal. Any user can create a fundraiser for any purpose related to open source projects. There are two types:\n" +
    "    <ul>\n" +
    "      <li>\"All or Nothing\" Fundraisers (where the defined goal must be achieved before any cash is provided to the Developer).</li>\n" +
    "      <li>\"Flexible\" Fundraisers (where 90% of all cash pledged is provided to the Developer, regardless of whether the goal is met).</li>\n" +
    "    </ul>\n" +
    "  </li>\n" +
    "  <li>\"<strong>Issues</strong>\" are features, bugs, development needs or other issues that are posted on Bountysource and are in need of an open source Solution.  Any User can define an Issue by posting the Issue on an issue tracking website such as GitHub or BitBucket.</li>\n" +
    "  <li>\"<strong>Repositories</strong>\" are the applicable open source project's code repository.  Bountysource does not act as a Repository for any Solutions or open source code.</li>\n" +
    "  <li>\"<strong>Solutions</strong>\" are an original creation by a Developer to try and solve a particular Issue on Bountysource.  Solutions are submitted to the applicable Repository and not directly to Bountysource. Persons authorized to accept and merge code will decide whether a Solution is accepted or not.</li>\n" +
    "</ul>\n" +
    "\n" +
    "<h3>2. Bounties</h3>\n" +
    "<p>2.1 A Backer pays Bountysource to encourage the development of a successful Solution to an Issue.  Bountysource will then post the terms of the Bounty on the Bountysource.com website. Backers must provide their payment at the time they create a Bounty. Backers consent to Bountysource and its payments partners charging their payment card or other payment method for the amount of their payment. Bounties are nonrefundable and an additional 10% charge is added at the time of payment (a Backer will be charged $110 for $100 Bounty).</p>\n" +
    "<p>2.2 Backers may create more than one Bounty on an Issue. Once a Bounty has been created, Backers may not decrease or cancel it.</p>\n" +
    "<p>2.3 Bounties are nonrefundable.</p>\n" +
    "<p>2.5 Bountysource will pay Bounties to the first Developer whose Solution is accepted.  Bountysource reserves the right (but is not obligated) to apportion Bounties if multiple Developers present Solutions simultaneously or if a Developer submits a partial Solution.</p>\n" +
    "<p>2.6 Committers, Backers and Developers and other users should not take any action in reliance on having a successful Solution until the successful Solution has been accepted by a Committer.</p>\n" +
    "<p>2.7 Developers should not take any action in reliance on having a Bounty awarded until Bountysource notifies them that they have the ability to withdraw and spend the money.</p>\n" +
    "<p>2.8 Because of occasional failures of payments from Backers, Bountysource cannot guarantee the full receipt of the Bounty amount pledged minus fees.</p>\n" +
    "<p>2.9 Bountysource and its payments partners will remove their fees before transmitting proceeds of a Bounty to Developers.</p>\n" +
    "<p>2.10 Bountysource reserves the right to reject, cancel, interrupt, remove, or suspend a Bounty at any time and for any reason. Bountysource is not liable for any damages as a result of any of those actions. Bountysource's policy is not to comment on the reasons for any of those actions.</p>\n" +
    "<p>2.11 By participating in our Service, you agree that Bountysource's good faith decisions will be final and not grounds for claims or litigation. Bountysource shall not be liable to you, and you hereby release us from any and all claims, for any damages resulting from or in connection with of any such determinations. Bountysource's policy is not to comment on the reasons for any of those actions.</p>\n" +
    "<p>2.12 <strong>Submitting Solutions</strong>. Developers are responsible for properly submitting their proposed Solutions to the appropriate Repositories. Bountysource does not receive, process or review proposed Solutions. If you are a Developer, you represent, warrant and promise that any Solution provided by you or on your behalf is an original creation of yours, was prepared in accordance with the applicable open source license, and does not (directly or indirectly) infringe the intellectual property rights or other legal rights of any third party.</p>\n" +
    "<p>2.13 <strong>Selection of Winning Solutions</strong>. The winning Solution will be selected by a Committer by merging code into their Repository. The first merged Solution wins the Bounty. You agree not to make claims against Bountysource or hold Bountysource responsible in connection with the determination of the winning Solution.</p>\n" +
    "\n" +
    "<h3>3. Fundraisers</h3>\n" +
    "<p>3.1 <strong>Creation of Fundraisers</strong>. Any Bountysource user may initiate a Fundraiser, which is a financial goal to raise money for any open-source project, event or coding need. The user must provide all information requested by Bountysource, which will include (but not be limited to):</p>\n" +
    "<ul>\n" +
    "  <li>Fundraising goal (how much they wish to raise)</li>\n" +
    "  <li>Description of the project and purpose (why are they raising money)</li>\n" +
    "</ul>\n" +
    "<p>3.2 <strong>Posting of Fundraisers</strong>. Upon the user's successful establishment of the Fundraiser, Bountysource will post the Fundraiser and encourage Backers to make pledges. Bountysource is not responsible for reviewing and approving the content of Fundraisers.  However, Bountysource reserves the right to cancel, modify or reject Fundraisers at any time.</p>\n" +
    "<p>3.3 <strong>Types of Fundraisers</strong>. There are two types of Fundraisers:</p>\n" +
    "<ul>\n" +
    "  <li>All-or-Nothing Fundraiser - Bountysource disburses funds if, and only if, the project's purpose has been met. If not, Bountysource returns 90% of funds to Backers.</li>\n" +
    "  <li>Flexible Fundraiser - Bountysource disburses 90% of funds as they are received, regardless of whether the project's purpose has been met.  Backer payments to Bountysource are nonrefundable.</li>\n" +
    "</ul>\n" +
    "<p>3.4 <strong>Rewards</strong>. Users that initiate a Fundraiser are encouraged (but not required) to give rewards to Backers who financially support the Fundraiser. Users are solely responsible for providing any rewards that they offer in a fair, reasonable and timely manner. Bountysource is not responsible and assumes no liability for provision of rewards (unless expressly agreed in a writing signed by Bountysource).</p>\n" +
    "<p>3.5 <strong>Use of Funds.</strong> Recipients of Fundraiser monies must apply all funds solely in ways that directly advance the stated project purpose. If requested by Bountysource, recipients must provide a complete and accurate accounting of the application of such funds. If Bountysource determines in good faith that funds have been misapplied or used contrary to the intent as expressed in this Agreement and in the applicable Bounty or Fundraiser posting, Bountysource may demand return of some or all of the funds, and recipients shall be obligated to repay such funds within three (3) business days of such demand.</p>\n" +
    "\n" +
    "<h3>4. Registration</h3>\n" +
    "<p>4.1 <strong>Registration Information</strong>. Some users of our Service, such as Developers and Backers, must register with Bountysource. If you are required to register, you must provide accurate, complete and current registration information and promptly correct and update your information while you have an account with Bountysource. Your provision of inaccurate or unreliable information, your failure to promptly update information provided to Bountysource, or your failure to respond for over 7 calendar days to inquiries by Bountysource concerning the accuracy of contact details associated with your registration shall constitute a material breach of this Agreement and be a basis for termination of your account.</p>\n" +
    "<p>4.2 <strong>Screen Name and Project Names</strong>. You must not select a screen name or project name that (i) is the name of another person, with the intent to impersonate that person; (ii) is subject to any rights of another person, without appropriate authorization; or (iii) is otherwise offensive, vulgar, or obscene. Bountysource reserves the right in its sole discretion to refuse registration of or cancel a screen name or project name.</p>\n" +
    "<p>4.3 <strong>Account Activity</strong>. You are solely responsible for activity that occurs on your account and shall be responsible for maintaining the confidentiality of your password for the Site. You must never use another user account without the other user's express permission. You will immediately notify Bountysource in writing of any unauthorized use of your account, or other known account-related security breach.</p>\n" +
    "\n" +
    "<h3>5. Fees and Taxes</h3>\n" +
    "<p>5.1 <strong>Fees</strong>. Joining Bountysource is free. Bountysource charges fees in connection with Bounties and Fundraisers as described on the Bountysource <a href=\"/fees\">Fees Page</a>.</p>\n" +
    "<p>5.2 <strong>Taxes</strong>. You are responsible for all taxes associated with your use of Bountysource. If you are a Developer that submits a successful Solution, you may be required to provide a completed W-9 or other tax form as requested by Bountysource prior to receiving any funds. Bountysource has no obligation to pay any amounts unless and until requested tax forms are properly completed and submitted. If you are paid any amounts by Bountysource, it is your responsibility to pay all income, sales, service, VAT and other taxes due in connection with the payment. Bountysource generally does not withhold amounts from payments unless required to do so by applicable law.</p>\n" +
    "<p>5.3 <strong>Not a Bank, Trust or Escrow</strong>. Bountysource is not a bank, trust or escrow and does not provide banking, trust or escrow services to anyone.  Bountysource does not hold any funds in bank, trust or escrow accounts on behalf of users.  All amounts paid to Bountysource under this Agreement belong solely to Bountysource at the time of payment and at all times thereafter, and Bountysource has no obligation to pay or refund such amounts, except as expressly required by this Agreement or other written and executed agreement between Bountysource and the user.  By using the Bountysource Site or Service and by agreeing to this Agreement, you acknowledge and agree to all the terms and conditions herein.</p>\n" +
    "\n" +
    "<h3>6. This Agreement</h3>\n" +
    "<p>6.1 <strong>Scope</strong>. This Agreement governs all users of the Bountysource Service and Site, including, without limitation, Committers, Backers, Developers and anyone else who uses or browses the Service or Site. The Service is offered subject to acceptance of all of the terms and conditions contained in this Agreement, including the Privacy Policy, and all other operating rules, policies, and procedures that may be published on the Site by Bountysource, which are incorporated by reference and may be updated by Bountysource without notice to you. In addition, some Services offered through the Site may be subject to additional terms and conditions adopted by Bountysource. Your use of those Services is subject to those additional terms and conditions, which are incorporated into this Agreement by this reference.</p>\n" +
    "<p>6.2 <strong>Minimum Age</strong>. The Service is available only to individuals who are at least 18 years old. You represent and warrant that if you are an individual, you are at least 18 years old and of legal age to form a binding contract.</p>\n" +
    "<p>6.3 <strong>Eligibility</strong>. Bountysource may, in its sole discretion, refuse to offer the Service to any person or entity and change its eligibility criteria at any time. This provision is void where prohibited by law and the right to access the Service is revoked in those jurisdictions.</p>\n" +
    "<p>6.4 <strong>Modifications</strong>. We reserve the right to amend the terms and conditions contained in this Agreement at any time by posting the amended Agreement in full to our Site without further notice. Changes will be effective immediately upon such posting, unless otherwise noted in the posting. We also reserve the right to change, suspend or discontinue the Site or Service (including, but not limited to, the availability of any feature, database or Solutions) at any time for any reason. Bountysource may also impose limits on certain features and Services or restrict your access to parts or all of the Service without notice or liability. It is your responsibility to check this Agreement and our Site periodically for changes. Your continued use of the Service following the posting of any changes to this Agreement or our Site or Services constitutes acceptance of those changes.</p>\n" +
    "<p>6.5 <strong>Termination</strong>. Bountysource may terminate your access to the Service, without cause or notice, which may result in the forfeiture and destruction of all information associated with your account. If you wish to terminate your account, you may do so by following the instructions on the Site. Any fees paid to Bountysource are non-refundable, except as otherwise expressly stated in this Agreement. All provisions of this Agreement that by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>\n" +
    "<p>6.6 <strong>Intellectual Property Rights</strong>. Bountysource is not the author or owner of any Solutions or other code developed in connection with a Bounty or Fundraiser. Bountysource does not guarantee or certify the open-source licensing availability of any Solutions or other code developed hereunder. Solutions and other code offered by Developers may be protected (in whole or in part) by copyrights, trademarks, service marks, patents, trade secrets, or other rights and laws. If you wish to use any part of a Solution or other code developed hereunder, you must obtain the rights to do so from the Repository or owner, as appropriate. You shall abide by and maintain all copyright and other legal notices, information, and restrictions contained in any Solutions or other code offered by Developers. You shall not sell, license, rent, or otherwise use or exploit any Solutions or other code for commercial use or in any way that violates any third-party right, unless authorized to do so under the appropriate license.</p>\n" +
    "\n" +
    "<h3>7. Rules and Conduct</h3>\n" +
    "<p>7.1 Your use of the Service must at all times be in good faith. You must not use the Service for any purpose that is prohibited by this Agreement. You shall abide by all applicable local, state, national, and international laws and regulations in your use of the Service, Site and Solutions.</p>\n" +
    "<p>7.2 You are responsible for all of your account activity in connection with the Service. You shall not, and shall not permit any third party using your account to, take any action (including, without limitation, submitting a Solution) that:</p>\n" +
    "<p>7.2.1 infringes any patent, trademark, trade secret, copyright, right of publicity, or other right of any other person or entity or violates any law or contract;</p>\n" +
    "<p>7.2.2 is false, misleading or inaccurate;</p>\n" +
    "<p>7.2.3 is unlawful, threatening, abusive, harassing, defamatory, libelous, deceptive, fraudulent, tortious, obscene, offensive, profane or invasive of another's privacy;</p>\n" +
    "<p>7.2.4 constitutes unsolicited or unauthorized advertising or promotional material or junk mail, spam or chain letters;</p>\n" +
    "<p>7.2.5 contains software viruses or any other computer codes, files, or programs that are designed or intended to disrupt, damage, limit, or interfere with the proper function of any software, hardware, or telecommunications equipment or to damage or obtain unauthorized access to any system, data, password, or other information of Bountysource or any third party;</p>\n" +
    "<p>7.2.6 misrepresents or impersonates any person or entity, including any employee or representative of Bountysource;</p>\n" +
    "<p>7.2.7 imposes or may impose (as determined by Bountysource in its sole discretion) an unreasonable or disproportionately large load on Bountysource's or its third-party providers' infrastructure;</p>\n" +
    "<p>7.2.8 interferes or attempts to interfere with the proper working of the Service or any activities conducted on the Service;</p>\n" +
    "<p>7.2.9 bypasses any measures Bountysource may use to prevent or restrict access to the Service (or other accounts, computer systems, or networks connected to the Service);</p>\n" +
    "<p>7.2.10 runs Maillist, Listserv, or any form of auto-responder or \"spam\" on the Service;</p>\n" +
    "<p>7.2.11 uses manual or automated software, devices, or other processes to \"crawl\" or \"spider\" any page of the Site;</p>\n" +
    "<p>7.2.12 attempts to directly or indirectly (i) decipher, decompile, disassemble, reverse engineer, or otherwise attempt to derive any source code or underlying ideas or algorithms of any part of the Service, except to the limited extent applicable laws specifically prohibit such restriction; (ii) modify, translate, or otherwise create derivative works of any part of the Service; or (iii) copy, rent, lease, distribute, or otherwise transfer any of the rights that you receive hereunder.</p>\n" +
    "\n" +
    "<h3>8. Our Rights</h3>\n" +
    "<p>8.1 We reserve the right in our sole discretion to suspend, cancel or modify the Service or to cancel your participation in the Service at any time. If you are a Developer, this means that you may be prohibited from continuing development for an Issue, from submitting a Solution, from participating in a Fundraiser, or from being awarded a Bounty for a Solution.</p>\n" +
    "<p>8.2 We reserve the right to disclose information about you or your registration or take other actions in our discretion:</p>\n" +
    "<p>8.2.1 if required by law or government rules or requirements;</p>\n" +
    "<p>8.2.2 to comply with any legal process served upon Bountysource;</p>\n" +
    "<p>8.2.3 if we believe it is necessary to avoid any financial loss or legal liability (whether civil or criminal) on the part of Bountysource or any of its related companies and their directors, officers, employees and agents;</p>\n" +
    "<p>8.2.4 in accordance with the practices disclosed in our privacy policy; or</p>\n" +
    "<p>8.2.5 if deemed necessary at our sole discretion to protect the integrity of the Service or protect the rights and property of Bountysource or its officers, directors, employees affiliates or agents, our users and third parties.</p>\n" +
    "<p>8.3 We may resolve or settle any and all third party claims, whether threatened or made, arising out of your registration or participation in an Issue.</p>\n" +
    "\n" +
    "<h3>9. Disclaimer</h3>\n" +
    "<p>Bountysource is a listing and project platform, and does not develop code or Solutions itself.  All code and Solutions developed or made available through Bountysource are developed by third party Developers.  Such Developers are not employees or agents of Bountysource, and (if any payments are made) are treated as independent contractors.  Accordingly, users of Bountysource agree to release and hold harmless Bountysource from and against any claims that code or Solutions are incomplete, do not work correctly, have bugs, or are otherwise unsuitable for a particular user's purpose.  TO THE FULLEST EXTENT PERMITTED BY LAW, BOUNTYSOURCE DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, REGARDING THE SERVICE, SITE, CODE DEVELOPED BY DEVELOPERS HEREUNDER, REWARDS OFFERED FOR PARTICIPATION IN FUNDRAISERS, AND SOLUTIONS ENCOURAGED THROUGH THE SERVICE, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR PARTICULAR USE. THE SERVICE IS PROVIDED \"AS IS\" AND \"AS AVAILABLE\" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY, AND FITNESS FOR A PARTICULAR PURPOSE, AND ANY WARRANTIES IMPLIED BY ANY COURSE OF PERFORMANCE OR USAGE OF TRADE ARE EXPRESSLY DISCLAIMED. BOUNTYSOURCE, AND ITS DIRECTORS, EMPLOYEES, AGENTS, SUPPLIERS, PARTNERS, AND CONTENT PROVIDERS DO NOT WARRANT THAT: (A) THE SERVICE WILL BE SECURE OR AVAILABLE AT ANY PARTICULAR TIME OR LOCATION; (B) ANY DEFECTS OR ERRORS IN THE SERVICE OR SOLUTIONS WILL BE CORRECTED; (C) ANY SOLUTIONS, CODE OR SOFTWARE DEVELOPED OR MADE AVAILABLE AT OR THROUGH THE SERVICE IS FREE OF ERRORS, VIRUSES OR OTHER HARMFUL COMPONENTS; OR (D) THE RESULTS OF USING THE SERVICE OR SUCH CODE OR SOLUTIONS WILL MEET YOUR REQUIREMENTS. YOUR USE OF THE SERVICE AND SOLUTIONS IS SOLELY AT YOUR OWN RISK. SOME STATES OR COUNTRIES DO NOT ALLOW LIMITATIONS ON HOW LONG AN IMPLIED WARRANTY LASTS, SO THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU. To the extent that such warranties cannot be disclaimed, you agree that the liability of Bountysource shall be limited to re-supply of the Services.</p>\n" +
    "\n" +
    "<h3>10. Limitation of Liability</h3>\n" +
    "<p>IN NO EVENT SHALL BOUNTYSOURCE, ITS AFFILIATED COMPANIES OR THEIR RESPECTIVE DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, PARTNERS, SUPPLIERS, OR DEVELOPERS, BE LIABLE UNDER CONTRACT, TORT, STRICT LIABILITY, NEGLIGENCE, OR ANY OTHER LEGAL OR EQUITABLE THEORY WITH RESPECT TO THE SERVICE OR SOLUTIONS ENCOURAGED BY THE SERVICE (I) FOR ANY LOST PROFITS, DATA LOSS, COST OF PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, OR SPECIAL, INDIRECT, INCIDENTAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES OF ANY KIND WHATSOEVER, INCLUDING, WITHOUT LIMITATION, SUBSTITUTE GOODS OR SERVICES (HOWEVER ARISING), (II) FOR ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE (REGARDLESS OF THE SOURCE OF ORIGINATION), OR (III) FOR ANY DAMAGES, LOSSES OR EXPENSES IN EXCESS OF (IN THE AGGREGATE) THE NET REVENUES COLLECTED BY BOUNTYSOURCE IN CONNECTION WITH THE PROJECT OR EVENT GIVING RISE TO THE CLAIM. SOME STATES OR COUNTRIES DO NOT ALLOW THE EXCLUSION OR LIMITATION OF INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE LIMITATIONS AND EXCLUSIONS MAY NOT APPLY TO YOU.</p>\n" +
    "\n" +
    "<h3>11. Indemnity</h3>\n" +
    "<p>You agree to indemnify, keep indemnified and forever hold harmless, Bountysource and its related companies, and its and their directors, officers, employees and agents, from and against any and all claims, damages, liabilities, costs and expenses (including reasonable legal fees and expenses) arising out of or in connection with your violation of any of the terms and conditions of this Agreement or your unauthorized use of the Service or any Solutions. Bountysource reserves the right to assume the exclusive defense and control of any matter otherwise subject to indemnification by you, in which event you will assist and cooperate with Bountysource in asserting any available defenses.</p>\n" +
    "\n" +
    "<h3>12. Third-Party Sites</h3>\n" +
    "<p>The Service and Site may link to other websites or resources on the Internet, and other websites or resources may contain links to the Site, such as Repositories. When you access third-party websites, you do so at your own risk. Those other websites are not under Bountysource's control, and you acknowledge that Bountysource is not liable for the content, functions, accuracy, legality, appropriateness, or any other aspect of those other websites or resources. The inclusion on another website of any link to the Site does not imply endorsement by or affiliation with Bountysource. You further acknowledge and agree that Bountysource shall not be liable for any damage related to the use of any content, goods, or services available through any third-party website or resource.</p>\n" +
    "\n" +
    "<h3>13. Miscellaneous</h3>\n" +
    "<p>13.1 <strong>Severability</strong>. The terms of this Agreement are severable. If any term or provision is declared invalid or unenforceable, it shall be severed from this Agreement and shall not affect the interpretation or operation of the remaining terms or provisions, which shall remain in full force and effect.</p>\n" +
    "<p>13.2 <strong>Entire Agreement</strong>. This Agreement, including the documents specifically incorporated by reference herein, constitutes the entire agreement between you and Bountysource regarding the provision of the Services and supersedes all prior or contemporaneous agreements and understandings, whether established by custom, practice, policy or precedent.</p>\n" +
    "<p>13.3 <strong>Governing Law</strong>. This Agreement (and any further rules, policies, or guidelines incorporated by reference) shall be governed by and construed in accordance with the laws of the State of California, without giving effect to any principles of conflicts of law, and without application of the Uniform Computer Information Transaction Act or the United Nations Convention of Controls for International Sale of Goods. You agree that Bountysource and its Services are deemed a passive website that does not give rise to personal jurisdiction over Bountysource or its parents, subsidiaries, affiliates, successors, assigns, employees, agents, directors, officers or shareholders, either specific or general, in any jurisdiction other than the State of California. You agree that any action at law or in equity arising out of or relating to these terms, or your use or non-use of the Services or Solutions, shall be filed only in the state or federal courts located in San Francisco County in the State of California and you hereby consent and submit to the personal jurisdiction of such courts for the purposes of litigating any such action. You hereby irrevocably waive any right you may have to trial by jury in any dispute, action, or proceeding.</p>\n" +
    "<p>13.4 <strong>International</strong>. Accessing the Service is prohibited from territories where the Solutions or Service is illegal. If you access the Service from other locations, you do so at your own initiative and are responsible for compliance with local laws.</p>\n" +
    "<p>13.5 <strong>Relationship</strong>. No agency, partnership, joint venture, or employment relationship is created as a result of this Agreement and neither party has any authority of any kind to bind the other in any respect. There are no intended third party beneficiaries of this Agreement.</p>\n" +
    "<p>13.6 <strong>Force Majeure</strong>. Bountysource shall not be liable for any failure to perform its obligations hereunder where the failure results from any cause beyond Bountysource's reasonable control, including, without limitation, mechanical, electronic, or communications failure or degradation.</p>\n" +
    "<p>13.7 <strong>Assignmen</strong>t. This Agreement is personal to you, and are not assignable, transferable, or sublicensable by you except with Bountysource's prior written consent. Bountysource may assign, transfer, or delegate any of its rights and obligations hereunder without consent.</p>\n" +
    "<p>13.8 <strong>Attorney Fees</strong>. If Bountysource prevails in any action or proceeding to enforce rights under this Agreement, it will be entitled to recover costs and attorneys' fees.</p>\n" +
    "<p>13.9 <strong>Waiver</strong>. Failure by Bountysource to exercise or enforce any right or provision of this Agreement shall not be deemed to be a waiver of such right or provision and does not affect the right to require any provision to be performed at any time thereafter.</p>\n" +
    "<p>13.10 <strong>Electronic Delivery, Notice Policy and Your Consent</strong>. By using the Services, you consent to receive from Bountysource all communications including notices, agreements, legally required disclosures, or other information in connection with the Services (collectively, \"Contract Notices\") electronically. Bountysource may provide the electronic Contract Notices by posting them on the Site. If you desire to withdraw your consent to receive Contract Notices electronically, you must discontinue your use of the Services.</p>\n" +
    "<p>13.11 <strong>Electronic Communications Privacy Act Notice (18 USC §2701-2711)</strong>. BOUNTYSOURCE MAKES NO GUARANTY OF CONFIDENTIALITY OR PRIVACY OF ANY COMMUNICATION OR INFORMATION TRANSMITTED ON THE SITE OR ANY WEBSITE LINKED TO THE SITE. Bountysource will not be liable for the privacy of email addresses, registration and identification information, disk space, communications, confidential or trade-secret information, or any Solutions received by Bountysource or stored on our equipment, transmitted over networks accessed by the Site, or otherwise connected with your use of the Service.</p>\n" +
    "\n" +
    "<p><i>Effective Date of Revision: July 12th, 2013</i></p>"
  );

  $templateCache.put("pages/activity/bounties.html",
    "<ul class=\"breadcrumb\">\n" +
    "  <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a href=\"/activity\">Activity</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a href=\"/activity/bounties\">Bounties</a></li>\n" +
    "</ul>\n" +
    "\n" +
    "<ng-include src=\"'pages/activity/tabs.html'\"></ng-include>\n" +
    "\n" +
    "<table class=\"table table-striped\">\n" +
    "  <thead>\n" +
    "  <tr>\n" +
    "    <th>Tracker</th>\n" +
    "    <th>Issue</th>\n" +
    "    <th>Issue Open</th>\n" +
    "    <th>Amount</th>\n" +
    "    <th>Status</th>\n" +
    "    <th>Date</th>\n" +
    "    <th>\n" +
    "      Anonymous\n" +
    "      <a popover-title=\"Anonymous Bounties\" popover=\"If you want to hide your identity on a bounty, make it anonymous. You can change this at anytime.\" popover-trigger=\"click\"><i class=\"icon-question-sign\"></i></a>\n" +
    "    </th>\n" +
    "  </tr>\n" +
    "  </thead>\n" +
    "\n" +
    "  <tbody>\n" +
    "  <tr ng-repeat=\"bounty in bounties\">\n" +
    "    <td><a ng-href=\"/trackers/{{bounty.issue.tracker.slug}}\">{{ bounty.issue.tracker.name }}</a></td>\n" +
    "    <td><a ng-href=\"/issues/{{bounty.issue.slug}}\">{{ bounty.issue.title }}</a></td>\n" +
    "    <td>{{ bounty.issue.can_add_bounty }}</td>\n" +
    "    <td>{{ bounty.amount | dollars }}</td>\n" +
    "    <td>{{ bounty.status }}</td>\n" +
    "    <td>{{ bounty.created_at | date }}</td>\n" +
    "\n" +
    "    <td ng-show=\"bounty.anonymous\">\n" +
    "      <button class=\"btn btn-small btn-block active\" ng-click=\"toggle_anonymous(bounty)\">\n" +
    "        <i class=\"icon-eye-close\"></i>\n" +
    "        Anonymized\n" +
    "      </button>\n" +
    "    </td>\n" +
    "    <td ng-hide=\"bounty.anonymous\">\n" +
    "      <button class=\"btn btn-small btn-block btn-success\" ng-click=\"toggle_anonymous(bounty)\">\n" +
    "        <i class=\"icon-eye-open icon-white\"></i>\n" +
    "        Publicized\n" +
    "      </button>\n" +
    "    </td>\n" +
    "  </tr>\n" +
    "  </tbody>\n" +
    "</table>"
  );

  $templateCache.put("pages/activity/fundraisers.html",
    "<ul class=\"breadcrumb\">\n" +
    "  <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a href=\"/activity\">Activity</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a href=\"/activity/fundraisers\">Fundraisers</a></li>\n" +
    "</ul>\n" +
    "\n" +
    "<ng-include src=\"'pages/activity/tabs.html'\"></ng-include>\n" +
    "\n" +
    "<table class=\"table table-striped\">\n" +
    "  <tr>\n" +
    "    <th>Title</th>\n" +
    "    <th>Goal</th>\n" +
    "    <th>Progress</th>\n" +
    "    <th>Status</th>\n" +
    "  </tr>\n" +
    "\n" +
    "  <tr ng-repeat=\"fundraiser in fundraisers\">\n" +
    "    <td><a ng-href=\"/fundraisers/{{fundraiser.slug}}\">{{ fundraiser.title }}</a></td>\n" +
    "    <td>{{ fundraiser.funding_goal | dollars }}</td>\n" +
    "    <td>{{ (fundraiser.total_pledged / fundraiser.funding_goal) | percent }}</td>\n" +
    "    <td ng-class=\"{ 'text-info': ((fundraiser | fundraiser_status) == 'draft'), 'text-success': ((fundraiser | fundraiser_status) == 'completed') }\">{{ fundraiser | fundraiser_status }}</td>\n" +
    "  </tr>\n" +
    "</table>"
  );

  $templateCache.put("pages/activity/pledges.html",
    "<ul class=\"breadcrumb\">\n" +
    "  <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a href=\"/activity\">Activity</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a href=\"/activity/pledges\">Pledges</a></li>\n" +
    "</ul>\n" +
    "\n" +
    "<ng-include src=\"'pages/activity/tabs.html'\"></ng-include>\n" +
    "\n" +
    "<table class=\"table table-striped\">\n" +
    "  <thead>\n" +
    "  <tr>\n" +
    "    <th>Fundraiser</th>\n" +
    "    <th>Amount</th>\n" +
    "    <th>Date</th>\n" +
    "    <th class=\"span2\">\n" +
    "      Anonymous\n" +
    "      <a popover-title=\"Anonymous Pledges\" popover=\"If you want to hide your identity on a pledge, make it anonymous. You can change this at anytime.\" popover-trigger=\"click\"><i class=\"icon-question-sign\"></i></a>\n" +
    "    </th>\n" +
    "  </tr>\n" +
    "  </thead>\n" +
    "\n" +
    "  <tbody>\n" +
    "  <tr ng-repeat=\"pledge in pledges\">\n" +
    "    <td><a ng-href=\"/fundraisers/{{ pledge.fundraiser.slug }}\">{{ pledge.fundraiser.title }}</a></td>\n" +
    "    <td><a ng-href=\"/issues/{{bounty.issue.slug}}\">{{ pledge.amount | dollars }}</a></td>\n" +
    "    <td>{{ pledge.created_at | date }}</td>\n" +
    "\n" +
    "    <td ng-show=\"pledge.anonymous\">\n" +
    "      <button class=\"btn btn-small btn-block active\" ng-click=\"toggle_anonymous(pledge)\">\n" +
    "        <i class=\"icon-eye-close\"></i>\n" +
    "        Anonymized\n" +
    "      </button>\n" +
    "    </td>\n" +
    "    <td ng-hide=\"pledge.anonymous\">\n" +
    "      <button class=\"btn btn-small btn-block btn-success\" ng-click=\"toggle_anonymous(pledge)\">\n" +
    "        <i class=\"icon-eye-open icon-white\"></i>\n" +
    "        Publicized\n" +
    "      </button>\n" +
    "    </td>\n" +
    "  </tr><tr>\n" +
    "  </tr></tbody>\n" +
    "</table>"
  );

  $templateCache.put("pages/activity/solutions.html",
    "<ul class=\"breadcrumb\">\n" +
    "  <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a href=\"/activity\">Activity</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a href=\"/activity/solutions\">Solutions</a></li>\n" +
    "</ul>\n" +
    "\n" +
    "<ng-include src=\"'pages/activity/tabs.html'\"></ng-include>\n" +
    "\n" +
    "<table class=\"table table-striped\">\n" +
    "  <tr>\n" +
    "    <th>Tracker</th>\n" +
    "    <th>Issue</th>\n" +
    "    <th>Status</th>\n" +
    "    <th>Date</th>\n" +
    "  </tr>\n" +
    "\n" +
    "  <tr ng-repeat=\"solution in solutions\">\n" +
    "    <td><a ng-href=\"/trackers/{{solution.issue.tracker.slug}}\">{{ solution.issue.tracker.name }}</a></td>\n" +
    "    <td><a ng-href=\"/issues/{{solution.issue.slug}}/solutions\">{{ solution.issue.title }}</a></td>\n" +
    "    <td ng-class=\"{ 'text-success': (solution.accepted), 'text-warning': (solution.disputed), 'text-error': (solution.rejected), 'text-info': (!solution.disputed && !solution.accepted && !solution.rejected) }\">{{ solution | solution_status | from_snake_case | title }}</td>\n" +
    "    <td>{{ solution.created_at | date }}</td>\n" +
    "  </tr>\n" +
    "</table>"
  );

  $templateCache.put("pages/activity/tabs.html",
    "<h1>Activity</h1>\n" +
    "\n" +
    "<ul class=\"nav nav-tabs\" ng-controller=\"ActivityTabs\">\n" +
    "  <li ng-repeat=\"tab in tabs\" ng-class=\"{active: is_active(tab.url) }\"><a ng-href=\"{{tab.url}}\">{{tab.name}}</a></li>\n" +
    "</ul>"
  );

  $templateCache.put("pages/activity/timeline.html",
    "<ul class=\"breadcrumb\">\n" +
    "  <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a href=\"/activity\">Activity</a></li>\n" +
    "</ul>\n" +
    "\n" +
    "<ng-include src=\"'pages/activity/tabs.html'\"></ng-include>\n" +
    "\n" +
    "<ng-include src=\"'pages/people/partials/timeline.html'\"></ng-include>"
  );

  $templateCache.put("pages/activity/transactions.html",
    "<ul class=\"breadcrumb\">\n" +
    "  <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a href=\"/activity\">Activity</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a href=\"/activity/transactions\">Transactions</a></li>\n" +
    "</ul>\n" +
    "\n" +
    "<ng-include src=\"'pages/activity/tabs.html'\"></ng-include>"
  );

  $templateCache.put("pages/auth/auth.html",
    "<div ng-hide=\"redirecting || pending_connect\">\n" +
    "  <div ng-show=\"error\">\n" +
    "    <alert type=\"'error'\" close=\"error = null\">{{error}}</alert>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"text-center hero-unit\">\n" +
    "    <h2>Authorize Bountysource</h2>\n" +
    "    <p class=\"lead\">Link your Bountysource account with {{provider | from_snake_case | title}}, allowing for jolly cooperation!</p>\n" +
    "    <button ng-click=\"accept()\" class=\"btn btn-large btn-success\" style=\"width: 150px\">Accept</button>\n" +
    "    <button ng-click=\"reject()\" class=\"btn btn-large btn-danger\" style=\"width: 150px\">Reject</button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-show=\"!redirecting && pending_connect\" class=\"text-center\">\n" +
    "  <p class=\"lead\">Connecting accounts...</p>\n" +
    "  <p>Please entertain yourself by staring at the loading bar below.</p>\n" +
    "  <progress value=\"100\" class=\"progress-striped active\"></progress>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-show=\"redirecting\" class=\"text-center\">\n" +
    "  <div class=\"text-center hero-unit\">\n" +
    "    <h2>Great Success!</h2>\n" +
    "    <p class=\"lead\">Redirecting to {{provider | from_snake_case | title}}...</p>\n" +
    "  </div>\n" +
    "</div>"
  );

  $templateCache.put("pages/fundraiser_updates/edit.html",
    "<ul class=\"breadcrumb\">\n" +
    "  <li><a ng-href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "  <!--<li><a ng-href=\"/fundraisers\">Fundraisers</a><span class=\"divider\">»</span></li>-->\n" +
    "  <li><a ng-href=\"/fundraisers/{{fundraiser.id}}\">{{fundraiser.title ||'Loading...'}}</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a ng-href=\"/fundraisers/{{fundraiser.id}}/updates\">Updates</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a>New Update</a></li>\n" +
    "</ul>\n" +
    "\n" +
    "<div class=\"row-fluid\" ng-show=\"fundraiser\">\n" +
    "  <div class=\"span9\">\n" +
    "    <div ng-include=\"'pages/fundraisers/partials/header.html'\"></div>\n" +
    "    <hr>\n" +
    "\n" +
    "    <input id=\"fundraiser-title\" class=\"span12\" type=\"text\" autofocus=\"true\" name=\"title\" ng-model=\"changes.title\" placeholder=\"The title of your update\">\n" +
    "    <textarea class=\"span12\" ng-model=\"changes.body\" rows=\"15\" placeholder=\"The body of your update. You can use GitHub Flavored Markdown here.\"></textarea>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"span3\">\n" +
    "    <div class=\"well well-large\">\n" +
    "      <button ng-disabled=\"!changes.title || !changes.body\" ng-click=\"save()\" class=\"btn btn-large btn-block btn-primary\">Save</button>\n" +
    "      <button ng-click=\"back()\" class=\"btn btn-large btn-block\">Cancel</button>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-include=\"'pages/fundraisers/partials/progress_small.html'\"></div>\n" +
    "  </div>\n" +
    "</div>"
  );

  $templateCache.put("pages/fundraiser_updates/partials/manage.html",
    "<div class=\"well\">\n" +
    "  <a class=\"btn btn-large btn-block\" ng-href=\"/fundraisers/{{fundraiser.slug}}/updates\">\n" +
    "    <i class=\"icon-list\"></i>\n" +
    "    All Updates\n" +
    "  </a>\n" +
    "  <a class=\"btn btn-large btn-block\" ng-hide=\"update.published_at\" ng-href=\"/fundraisers/{{fundraiser.slug}}/updates/{{update.id}}/edit\">\n" +
    "    <i class=\"icon-pencil\"></i>\n" +
    "    Edit\n" +
    "  </a>\n" +
    "  <button ng-click=\"publish()\" ng-hide=\"update.published_at\" class=\"btn btn-large btn-success btn-block\">\n" +
    "    <i class=\"icon-globe icon-white\"></i>\n" +
    "    Publish\n" +
    "  </button>\n" +
    "  <button ng-click=\"destroy()\" ng-hide=\"update.published_at\" class=\"btn btn-large btn-danger btn-block\">\n" +
    "    <i class=\"icon icon-trash icon-white\"></i>\n" +
    "    Delete\n" +
    "  </button>\n" +
    "</div>"
  );

  $templateCache.put("pages/fundraiser_updates/show.html",
    "<ul class=\"breadcrumb\">\n" +
    "  <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "  <!--<li><a href=\"/fundraisers\">Fundraisers</a><span class=\"divider\">»</span></li>-->\n" +
    "  <li><a ng-href=\"/fundraisers/{{fundraiser.id}}\">{{fundraiser.title ||'Loading...'}}</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a ng-href=\"/fundraisers/{{fundraiser.id}}/updates\">Updates</a><span class=\"divider\">»</span></li>\n" +
    "  <li ng-show=\"update\"><a ng-href=\"/fundraisers/{{fundraiser.id}}/updates/{{update.id}}\">Update #{{update.number}}</a></li>\n" +
    "  <li ng-hide=\"update\"><a ng-href=\"/fundraisers/{{fundraiser.id}}/updates/{{update.id}}\">Loading...</a></li>\n" +
    "</ul>\n" +
    "\n" +
    "<div class=\"row-fluid\" ng-show=\"fundraiser\">\n" +
    "  <div class=\"span9\">\n" +
    "    <div ng-include=\"'pages/fundraisers/partials/header.html'\"></div>\n" +
    "\n" +
    "    <hr>\n" +
    "\n" +
    "    <div ng-show=\"update\" ng-controller=\"FundraisersController\">\n" +
    "      <div ng-show=\"update.published_at\">\n" +
    "        <h2><span class=\"text-success\">#{{ update.number }}</span> {{ update.title }}</h2>\n" +
    "        <div class=\"muted\">Published {{ update.published_at | date }}</div>\n" +
    "      </div>\n" +
    "\n" +
    "      <div ng-hide=\"update.published_at\">\n" +
    "        <div class=\"alert alert-info\"><strong>Note:</strong> This update has not been published. When you are ready to ship it, click the Publish button to the right!</div>\n" +
    "        <h2><span class=\"text-info\">#{{ fundraiser.updates.length }}</span> {{ update.title || 'Untitled' }}</h2>\n" +
    "        <div class=\"muted\">Last modified {{ update.updated_at | date }}</div>\n" +
    "      </div>\n" +
    "\n" +
    "      <br>\n" +
    "      <div ng-bind-html=\"update.body_html\"></div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"span3\" ng-controller=\"FundraisersController\">\n" +
    "    <div ng-include=\"'pages/fundraiser_updates/partials/manage.html'\"></div>\n" +
    "    <div ng-include=\"'pages/fundraisers/partials/about_me.html'\"></div>\n" +
    "    <div ng-include=\"'pages/fundraisers/partials/progress_small.html'\"></div>\n" +
    "    <div ng-include=\"'pages/fundraisers/partials/pledge_button.html'\"></div>\n" +
    "  </div>\n" +
    "</div>"
  );

  $templateCache.put("pages/fundraisers/create.html",
    "<ul class=\"breadcrumb\">\n" +
    "  <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "  <!--<li><a href=\"/fundraisers\">Fundraisers</a><span class=\"divider\">»</span></li>-->\n" +
    "  <li><a>New Fundraiser</a></li>\n" +
    "</ul>\n" +
    "\n" +
    "<alert ng-show=\"error\" type=\"error\" close=\"error = null\">Error</alert>\n" +
    "\n" +
    "<ng-form name=\"form\">\n" +
    "  <alert ng-show=\"error\">{{ error }}</alert>\n" +
    "\n" +
    "  <div class=\"row-fluid\">\n" +
    "    <div class=\"span9\">\n" +
    "      <!--Edit Title and Short Description-->\n" +
    "      <input id=\"fundraiser-title\" class=\"span12\" type=\"text\" autofocus=\"true\" name=\"title\" ng-model=\"fundraiser.title\" placeholder=\"The title of your fundraiser\">\n" +
    "      <textarea class=\"span12 lead\" rows=\"2\" name=\"description\" ng-model=\"fundraiser.short_description\" placeholder=\"Briefly describe your fundraiser\"></textarea>\n" +
    "\n" +
    "      <ng-form class=\"form-horizontal\" name=\"urls\">\n" +
    "        <div class=\"control-group\">\n" +
    "          <label class=\"control-label\" for=\"repo-url\">Image URL</label>\n" +
    "          <div class=\"controls\">\n" +
    "            <input class=\"span8\" id=\"repo-url\" type=\"url\" ng-model=\"fundraiser.image_url\" placeholder=\"https://cdn.awesome.com/abc123\">\n" +
    "          </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"control-group\">\n" +
    "          <label class=\"control-label\" for=\"homepage-url\">Homepage</label>\n" +
    "          <div class=\"controls\">\n" +
    "            <input class=\"span8\" id=\"homepage-url\" type=\"url\" ng-model=\"fundraiser.homepage_url\" placeholder=\"https://www.bountysource.com\">\n" +
    "          </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"control-group\">\n" +
    "          <label class=\"control-label\" for=\"repo-url\">Repository</label>\n" +
    "          <div class=\"controls\">\n" +
    "            <input class=\"span8\" id=\"repo-url\" type=\"url\" ng-model=\"fundraiser.repo_url\" placeholder=\"https://github.com/bountysource/frontend\">\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </ng-form>\n" +
    "\n" +
    "      <!--Edit main Description-->\n" +
    "      <div class=\"alert alert-info\">\n" +
    "        <strong>Protip:</strong> You can format your description using <a href=\"https://help.github.com/articles/github-flavored-markdown\" target=\"_blank\">GitHub Flavored Markdown</a>.\n" +
    "      </div>\n" +
    "      <textarea id=\"fundraiser-description\" class=\"span12\" rows=\"15\" ng-model=\"fundraiser.description\" placeholder=\"A description of your goal with this fundraiser.\"></textarea>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"span3\">\n" +
    "      <!--Big Create Fundraiser button-->\n" +
    "      <div class=\"well well-large\">\n" +
    "        <button ng-click=\"create()\" ng-disabled=\"!fundraiser.title || urls.$invalid\" class=\"btn btn-large btn-block btn-success\">Create Fundraiser</button>\n" +
    "      </div>\n" +
    "\n" +
    "      <!--About the author-->\n" +
    "      <h3>By <a ng-href=\"/people/{{current_person.slug}}\">{{current_person.display_name}}</a></h3>\n" +
    "      <div style=\"margin-bottom: 15px\">\n" +
    "        <a class=\"thumbnail\" ng-href=\"/people/{{current_person.slug}}\">\n" +
    "          <img ng-src=\"{{current_person.image_url}}\">\n" +
    "        </a>\n" +
    "        <div>{{ current_person.bio }}</div>\n" +
    "      </div>\n" +
    "\n" +
    "      <!--Disabled Pledge Now button-->\n" +
    "      <button class=\"btn btn-block btn-large\" disabled=\"disabled\">Pledge Now</button>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</ng-form>"
  );

  $templateCache.put("pages/fundraisers/edit.html",
    "<ul class=\"breadcrumb\">\n" +
    "  <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "  <!--<li><a href=\"/fundraisers\">Fundraisers</a><span class=\"divider\">»</span></li>-->\n" +
    "  <li><a href=\"/fundraisers/{{fundraiser.id}}\">{{ fundraiser.title || 'Loading...' }}</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a>Edit</a></li>\n" +
    "</ul>\n" +
    "\n" +
    "<div class=\"row-fluid\">\n" +
    "  <div class=\"span9\">\n" +
    "    <div ng-show=\"error\">\n" +
    "      <alert type=\"'error'\" close=\"error = null\">{{ error }}</alert>\n" +
    "    </div>\n" +
    "\n" +
    "    <!--Edit Title and Short Description-->\n" +
    "    <input id=\"fundraiser-title\" class=\"span12\" type=\"text\" autofocus=\"true\" name=\"title\" ng-model=\"changes.title\" placeholder=\"The title of your fundraiser\">\n" +
    "    <textarea class=\"span12 lead\" rows=\"2\" name=\"description\" ng-model=\"changes.short_description\" placeholder=\"Briefly describe your fundraiser\"></textarea>\n" +
    "\n" +
    "    <ng-form class=\"form-horizontal\" name=\"urls\">\n" +
    "      <div class=\"control-group\">\n" +
    "        <label class=\"control-label\" for=\"repo-url\">Image URL</label>\n" +
    "        <div class=\"controls\">\n" +
    "          <input class=\"span8\" id=\"repo-url\" type=\"url\" ng-model=\"fundraiser.image_url\" placeholder=\"https://cdn.awesome.com/abc123\">\n" +
    "        </div>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"control-group\">\n" +
    "        <label class=\"control-label\" for=\"homepage-url\">Homepage</label>\n" +
    "        <div class=\"controls\">\n" +
    "          <input class=\"span8\" id=\"homepage-url\" type=\"url\" ng-model=\"fundraiser.homepage_url\" placeholder=\"https://www.bountysource.com\">\n" +
    "        </div>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"control-group\">\n" +
    "        <label class=\"control-label\" for=\"repo-url\">Repository</label>\n" +
    "        <div class=\"controls\">\n" +
    "          <input class=\"span8\" id=\"repo-url\" type=\"url\" ng-model=\"fundraiser.repo_url\" placeholder=\"https://github.com/bountysource/frontend\">\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </ng-form>\n" +
    "\n" +
    "    <!--Edit main Description-->\n" +
    "    <div class=\"alert alert-info\">\n" +
    "      <strong>Protip:</strong> You can format your description using <a href=\"https://help.github.com/articles/github-flavored-markdown\" target=\"_blank\">GitHub Flavored Markdown</a>.\n" +
    "    </div>\n" +
    "    <textarea id=\"fundraiser-description\" class=\"span12\" rows=\"15\" ng-model=\"changes.description\" placeholder=\"A description of your goal for this fundraiser. You can use GitHub flavored markdown here.\"></textarea>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"span3\">\n" +
    "    <div ng-show=\"unsaved_changes()\">\n" +
    "      <alert class=\"alert alert-warning\"><strong>Hey! You have unsaved changes!</strong> Don't forget to <a ng-click=\"save()\">save your changes</a> when you are done.</alert>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"well well-large\">\n" +
    "      <button ng-click=\"save()\" class=\"btn btn-primary btn-large btn-block\">Save</button>\n" +
    "      <button ng-click=\"cancel()\" class=\"btn btn-large btn-block\">Cancel</button>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-controller=\"RewardsController\">\n" +
    "      <h3>Rewards</h3>\n" +
    "\n" +
    "      <accordion close-others=\"false\">\n" +
    "        <div ng-repeat=\"reward in fundraiser.rewards | orderBy:'amount'\">\n" +
    "          <accordion-group heading=\"${{reward.amount | number:0}} Reward\" is-open=\"reward.$is_open\">\n" +
    "            <div style=\"text-align: center\">\n" +
    "              <!--Reward amount-->\n" +
    "              <div class=\"input-prepend\" style=\"margin-bottom:0\">\n" +
    "                <span class=\"add-on\">$</span>\n" +
    "                <input type=\"number\" ng-model=\"reward.amount\" min=\"5\" required=\"\" placeholder=\"Minimum Pledge Amount\" ng-disabled=\"fundraiser.published\">\n" +
    "              </div>\n" +
    "\n" +
    "              <!--Reward quantity-->\n" +
    "              <div style=\"margin-top: 5px\">\n" +
    "                <div style=\"vertical-align: middle; display: inline-block\">0 of </div>\n" +
    "                <input style=\"vertical-align: middle; display: inline-block; width: 70px; margin: 0\" placeholder=\"∞\" type=\"number\" min=\"0\" ng-model=\"reward.limited_to\" ng-disabled=\"fundraiser.published\" tooltip=\"Leave empty for no limit\" tooltip-placement=\"bottom\" tooltip-trigger=\"focus\">\n" +
    "                <div style=\"vertical-align: middle; display: inline-block\"> claimed</div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "            <br>\n" +
    "\n" +
    "            <!--Reward description-->\n" +
    "            <textarea class=\"span12\" rows=\"5\" ng-model=\"reward.description\" required=\"\" placeholder=\"A description of this reward.\" ng-disabled=\"fundraiser.published\"></textarea>\n" +
    "\n" +
    "            <!--Fulfillment Details-->\n" +
    "            <textarea class=\"span12\" rows=\"5\" ng-model=\"reward.fulfillment_details\" placeholder=\"Request additional information from backers to fulfill this reward. For example, you may need to ask for a shirt size, mailing address, etc.\"></textarea>\n" +
    "\n" +
    "            <div class=\"row-fluid\">\n" +
    "              <div class=\"span6\">\n" +
    "                <!--Add that bad boy!-->\n" +
    "                <button ng-click=\"update_reward(fundraiser, reward)\" class=\"btn btn-primary btn-block\">\n" +
    "                  Save\n" +
    "                </button>\n" +
    "              </div>\n" +
    "              <div class=\"span3\">\n" +
    "                <!--Add that bad boy!-->\n" +
    "                <button ng-click=\"cancel_reward_changes(reward)\" class=\"btn btn-block\" tooltip=\"Cancel\" tooltip-placement=\"top\" tooltip-trigger=\"mouseenter\">\n" +
    "                  <i class=\"icon-remove\"></i>\n" +
    "                </button>\n" +
    "              </div>\n" +
    "              <div class=\"span3\">\n" +
    "                <!--Destroy button-->\n" +
    "                <button ng-disabled=\"fundraiser.published\" ng-click=\"destroy_reward(fundraiser, reward)\" class=\"btn btn-block\" tooltip=\"Delete\" tooltip-placement=\"top\" tooltip-trigger=\"mouseenter\">\n" +
    "                  <i class=\"icon-trash\"></i>\n" +
    "                </button>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "          </accordion-group>\n" +
    "        </div>\n" +
    "\n" +
    "        <accordion-group id=\"dat\" heading=\"Add new reward\" is-open=\"true\">\n" +
    "          <div ng-show=\"reward_error\">\n" +
    "            <alert type=\"'error'\" close=\"reward_error = null\">{{reward_error}}</alert>\n" +
    "          </div>\n" +
    "\n" +
    "          <div style=\"text-align: center\">\n" +
    "            <!--Reward amount-->\n" +
    "            <div class=\"input-prepend\" style=\"margin-bottom:0\">\n" +
    "              <span class=\"add-on\">$</span>\n" +
    "              <input type=\"number\" name=\"amount\" ng-model=\"new_reward.amount\" min=\"5\" required=\"\" placeholder=\"Minimum Pledge Amount\">\n" +
    "            </div>\n" +
    "\n" +
    "            <!--Reward quantity-->\n" +
    "            <div style=\"margin-top: 5px\">\n" +
    "              <div style=\"vertical-align: middle; display: inline-block\">0 of </div>\n" +
    "              <input style=\"vertical-align: middle; display: inline-block; width: 70px; margin: 0\" placeholder=\"∞\" type=\"number\" min=\"0\" ng-model=\"new_reward.limited_to\" tooltip=\"Leave empty for no limit\" tooltip-placement=\"bottom\" tooltip-trigger=\"focus\">\n" +
    "              <div style=\"vertical-align: middle; display: inline-block\"> claimed</div>\n" +
    "            </div>\n" +
    "          </div>\n" +
    "          <br>\n" +
    "\n" +
    "          <!--Reward description-->\n" +
    "          <textarea class=\"span12\" rows=\"5\" ng-model=\"new_reward.description\" required=\"\" placeholder=\"A description of this reward.\"></textarea>\n" +
    "\n" +
    "          <!--Fulfillment Details-->\n" +
    "          <textarea class=\"span12\" rows=\"5\" ng-model=\"new_reward.fulfillment_details\" placeholder=\"Request additional information from backers to fulfill this reward. For example, you may need to ask for a shirt size, mailing address, etc.\"></textarea>\n" +
    "\n" +
    "          <!--Add that bad boy!-->\n" +
    "          <button ng-disabled=\"!new_reward.amount || !new_reward.description\" ng-click=\"create_reward(fundraiser)\" class=\"btn btn-success btn-block\">Add Reward</button>\n" +
    "        </accordion-group>\n" +
    "      </accordion>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );

  $templateCache.put("pages/fundraisers/index.html",
    "<p>All Fundraisers!</p>"
  );

  $templateCache.put("pages/fundraisers/partials/about_me.html",
    "<div style=\"margin-bottom: 15px\">\n" +
    "  <a class=\"thumbnail\" ng-href=\"/people/{{fundraiser.person.slug}}\">\n" +
    "    <img ng-src=\"{{fundraiser.person.image_url}}\">\n" +
    "  </a>\n" +
    "\n" +
    "  <div>{{ fundraiser.person.bio }}</div>\n" +
    "</div>"
  );

  $templateCache.put("pages/fundraisers/partials/description_input.html",
    "<textarea id=\"fundraiser-description\" class=\"span12\" rows=\"15\" ng-model=\"changes.description\" placeholder=\"A description of your goal with this fundraiser. You can use GitHub flavored markdown here.\"></textarea>"
  );

  $templateCache.put("pages/fundraisers/partials/header.html",
    "<div style=\"margin-bottom: 10px\">\n" +
    "  <a ng-href=\"/fundraisers/{{fundraiser.slug}}\" style=\"display: inline-block; vertical-align: middle; width: 75px; height: 75px; background-repeat: no-repeat; background-size: 95% auto; background-position: center center; background-image: url({{fundraiser.image_url}})\">\n" +
    "  </a>\n" +
    "  <h1 style=\"margin: 0; display: inline-block; vertical-align: middle\">{{ fundraiser.title || 'Loading...' }}</h1>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<a require-twitter=\"\" href=\"https://twitter.com/share\" class=\"twitter-share-button\" data-lang=\"en\">Tweet</a>\n" +
    "<div require-gplus=\"\" class=\"g-plusone\" data-size=\"medium\" data-annotation=\"bubble\"></div>\n" +
    "<div class=\"input-prepend\">\n" +
    "  <div class=\"add-on\">\n" +
    "    <i class=\"icon-share\"></i>\n" +
    "    Embed\n" +
    "  </div>\n" +
    "  <input select-on-click=\"\" type=\"text\" style=\"cursor: pointer\" value=\"<iframe src='https://api.bountysource.com/user/fundraisers/{{fundraiser.id}}/embed' style='width: 238px; height: 402px; overflow: hidden; border: 0px;'></iframe>\" readonly=\"readonly\">\n" +
    "</div>\n" +
    "\n" +
    "<p class=\"lead\" ng-show=\"fundraiser\">{{ fundraiser.short_description }}</p>"
  );

  $templateCache.put("pages/fundraisers/partials/header_inputs.html",
    "<input id=\"fundraiser-title\" class=\"span12\" type=\"text\" autofocus=\"true\" name=\"title\" ng-model=\"changes.title\" placeholder=\"The title of your fundraiser\">\n" +
    "<textarea class=\"span12 lead\" rows=\"2\" name=\"description\" ng-model=\"changes.short_description\" placeholder=\"Briefly describe your fundraiser\"></textarea>"
  );

  $templateCache.put("pages/fundraisers/partials/homepage_card.html",
    "<div style=\"margin-bottom: 10px; padding: 2px\">\n" +
    "  <div class=\"row-fluid\">\n" +
    "    <div class=\"span2\">\n" +
    "      <a ng-href=\"/fundraisers/{{fundraiser.slug}}\" style=\"display: block; width: 75px; height: 75px; background-repeat: no-repeat; background-size: 95% auto; background-position: center center; background-image: url({{fundraiser.image_url}})\">\n" +
    "      </a>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"span10\">\n" +
    "      <strong><a ng-href=\"/fundraisers/{{fundraiser.slug}}\">{{fundraiser.title}}</a></strong>\n" +
    "      <small class=\"muted\">by <a ng-href=\"/people/{{fundraiser.person.slug}}\">{{fundraiser.person.display_name}}</a></small>\n" +
    "      <br>\n" +
    "      <small class=\"muted\"><a ng-href=\"/fundraisers/{{fundraiser.slug}}\">{{fundraiser.short_description | truncate:70}}</a></small>\n" +
    "      <br>\n" +
    "      <div class=\"progress\" style=\"margin: 0; width: 60%; display: inline-block; vertical-align: middle\">\n" +
    "        <div class=\"bar bar-success\" style=\"width: {{100*fundraiser.total_pledged/fundraiser.funding_goal | at_least:15 | at_most:100 | number:0 }}%\">{{100*fundraiser.total_pledged/fundraiser.funding_goal | number:0 }}%</div>\n" +
    "      </div>\n" +
    "      <div class=\"text-success\" style=\"display: inline-block; vertical-align: middle\"><small><strong>{{fundraiser.total_pledged | dollars}}</strong> of <strong>{{fundraiser.funding_goal | dollars}}</strong> pledged</small></div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );

  $templateCache.put("pages/fundraisers/partials/manage.html",
    "<div class=\"well well-large\" ng-show=\"can_manage\" ng-hide=\"!fundraiser.owner || (fundraiser.published && !fundraiser.in_progress)\">\n" +
    "  <a ng-href=\"/fundraisers/{{ fundraiser.slug }}/edit\" class=\"btn btn-large btn-block\">\n" +
    "    <i class=\"icon-edit\"></i>\n" +
    "    Edit Fundraiser\n" +
    "  </a>\n" +
    "\n" +
    "  <button ng-controller=\"FundraiserUpdatesController\" ng-show=\"fundraiser.published\" ng-click=\"create_update()\" class=\"btn btn-large btn-block\">\n" +
    "    <i class=\"icon-pencil\"></i>\n" +
    "    New Update\n" +
    "  </button>\n" +
    "\n" +
    "  <button ng-hide=\"fundraiser.published\" ng-disabled=\"!fundraiser.publishable\" ng-click=\"publish(fundraiser)\" class=\"btn btn-large btn-block btn-success\">\n" +
    "    <i class=\"icon-globe icon-white\"></i>\n" +
    "    Publish Fundraiser\n" +
    "  </button>\n" +
    "</div>"
  );

  $templateCache.put("pages/fundraisers/partials/nav_tabs.html",
    "<ul class=\"nav nav-tabs\" ng-controller=\"FundraiserNavTabsController\">\n" +
    "  <li ng-class=\"active_tab('overview')\"><a ng-href=\"/fundraisers/{{ fundraiser.slug }}\">Overview</a></li>\n" +
    "  <li ng-class=\"active_tab('updates')\" ng-show=\"fundraiser.published\"><a ng-href=\"/fundraisers/{{ fundraiser.slug }}/updates\">\n" +
    "    Updates\n" +
    "    <span ng-show=\"fundraiser.updates.length > 0\" class=\"badge badge-info\">{{fundraiser.updates.length | number:0}}</span>\n" +
    "  </a></li>\n" +
    "  <li ng-class=\"active_tab('pledges')\" ng-show=\"fundraiser.published\"><a ng-href=\"/fundraisers/{{ fundraiser.slug }}/pledges\">\n" +
    "    Pledges\n" +
    "    <span ng-show=\"fundraiser.pledge_count > 0\" class=\"badge badge-info\">{{fundraiser.pledge_count | number:0}}</span>\n" +
    "  </a></li>\n" +
    "  <li ng-class=\"active_tab('rewards')\" ng-show=\"fundraiser.can_manage && fundraiser.published\"><a ng-href=\"/fundraisers/{{ fundraiser.slug }}/rewards\">\n" +
    "    <i class=\"icon-lock\"></i>\n" +
    "    Reward Stats\n" +
    "  </a></li>\n" +
    "  <li ng-class=\"active_tab('pledge_now')\" ng-show=\"fundraiser.published && fundraiser.in_progress\"><a ng-href=\"/fundraisers/{{ fundraiser.slug }}/pledge\">Pledge Now</a></li>\n" +
    "</ul>"
  );

  $templateCache.put("pages/fundraisers/partials/overview.html",
    "<img class=\"pull-right\" id=\"fundraiser-image\" ng-src=\"{{ fundraiser.image_url }}\">"
  );

  $templateCache.put("pages/fundraisers/partials/pledge_button.html",
    "<a ng-show=\"!fundraiser.published\" disabled=\"disabled\" class=\"btn btn-large btn-block\">Pledge Now</a>\n" +
    "<a ng-show=\"fundraiser.days_remaining <= 0\" disabled=\"disabled\" class=\"btn btn-large btn-block\">Completed {{fundraiser.ends_at | date}}</a>\n" +
    "<a ng-show=\"fundraiser.in_progress\" ng-href=\"/fundraisers/{{ fundraiser.slug }}/pledge\" ng-show=\"fundraiser.published\" class=\"btn btn-large btn-success btn-block\">Pledge Now</a>"
  );

  $templateCache.put("pages/fundraisers/partials/progress.html",
    "<div class=\"row-fluid\">\n" +
    "  <div class=\"span12\" style=\"text-align: center\">\n" +
    "    <div style=\"margin-top: 10px\">\n" +
    "      <div class=\"row-fluid\">\n" +
    "        <div class=\"span3\">\n" +
    "          <h1 style=\"margin-bottom:0\"><strong>${{ fundraiser.total_pledged | number:0 }}</strong></h1>\n" +
    "          <span>raised of <strong>${{ fundraiser.funding_goal | number:0 }}</strong> goal</span>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"span3\" style=\"text-align: center\">\n" +
    "          <h1 style=\"margin-bottom:0\"><strong>{{ fundraiser.pledge_count | number }}</strong></h1>\n" +
    "          <span>backers</span>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"span3\" style=\"text-align: center\">\n" +
    "          <h1 style=\"margin-bottom:0\"><strong>{{ fundraiser.funding_percentage | number:0 }}%</strong></h1>\n" +
    "          <span>funded</span>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"span3\" style=\"text-align: center\">\n" +
    "          <div ng-show=\"!fundraiser.published || fundraiser.days_remaining > 0\">\n" +
    "            <h1 style=\"margin-bottom:0\"><strong>{{ (fundraiser.days_remaining || 30) | number }}</strong></h1>\n" +
    "            <span>days left</span>\n" +
    "          </div>\n" +
    "\n" +
    "          <div ng-show=\"fundraiser.days_remaining <= 0\">\n" +
    "            <h1 style=\"margin-bottom:0\"><strong>Completed</strong></h1>\n" +
    "            <span>{{ fundraiser.ends_at | date:'medium' }}</span>\n" +
    "          </div>\n" +
    "\n" +
    "        </div>\n" +
    "      </div>\n" +
    "      <br>\n" +
    "\n" +
    "      <progress class=\"progress-success progress-striped\" value=\"fundraiser.funding_percentage\"></progress>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );

  $templateCache.put("pages/fundraisers/partials/progress_small.html",
    "<div class=\"row-fluid\">\n" +
    "  <div class=\"span12\" style=\"text-align: center\">\n" +
    "    <div style=\"margin-top: 10px\">\n" +
    "      <div class=\"row-fluid\">\n" +
    "        <div class=\"span6\">\n" +
    "          <h3 style=\"margin-bottom:0\"><strong>${{ fundraiser.total_pledged | number:0 }}</strong></h3>\n" +
    "          <span>raised of <strong>${{ fundraiser.funding_goal | number:0 }}</strong> goal</span>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"span6\" style=\"text-align: center\">\n" +
    "          <div ng-show=\"!fundraiser.published || fundraiser.days_remaining > 0\">\n" +
    "            <h3 style=\"margin-bottom:0\"><strong>{{ (fundraiser.days_remaining || 30) | number }}</strong></h3>\n" +
    "            <span>days left</span>\n" +
    "          </div>\n" +
    "\n" +
    "          <div ng-show=\"fundraiser.days_remaining <= 0\">\n" +
    "            <h3 style=\"margin-bottom:0\"><strong>Completed</strong></h3>\n" +
    "            <span>{{fundraiser.ends_at | date}}</span>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "      <br>\n" +
    "      <progress class=\"progress-success progress-striped\" value=\"fundraiser.funding_percentage\"></progress>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );

  $templateCache.put("pages/fundraisers/partials/rewards.html",
    "<table class=\"table table-striped table-bordered\">\n" +
    "  <tr ng-repeat=\"reward in fundraiser.rewards\" ng-class=\"reward.sold_out && 'warning'\">\n" +
    "    <td>\n" +
    "      <div style=\"text-align: center\">\n" +
    "        <h2 style=\"margin-bottom:0\"><strong>{{ reward.amount | dollars }}</strong></h2>\n" +
    "        <span ng-show=\"reward.limited_to\">{{ reward.claimed | number }} of {{ reward.limited_to | number }} claimed</span>\n" +
    "        <span ng-hide=\"reward.limited_to\">{{ reward.claimed | number }} claimed</span>\n" +
    "      </div>\n" +
    "      <br>\n" +
    "      <p style=\"padding: 0 10px; white-space: pre-wrap\">{{ reward.description }}</p>\n" +
    "      <div style=\"text-align: center\">\n" +
    "\n" +
    "        <a ng-show=\"fundraiser.in_progress && !reward.sold_out && !fundraiser.published\" class=\"btn btn-large btn-info\" disabled=\"disabled\">Claim Reward</a>\n" +
    "        <a ng-show=\"fundraiser.in_progress && !reward.sold_out && fundraiser.published\" ng-href=\"/fundraisers/{{fundraiser.slug}}/pledge?reward_id={{reward.id}}&amount={{reward.amount}}\" class=\"btn btn-large btn-info\">Claim Reward</a>\n" +
    "\n" +
    "        <a ng-show=\"fundraiser.in_progress && reward.sold_out\" class=\"btn btn-large\" disabled=\"disabled\">Sold Out</a>\n" +
    "      </div>\n" +
    "      <br>\n" +
    "    </td>\n" +
    "  </tr>\n" +
    "</table>"
  );

  $templateCache.put("pages/fundraisers/partials/updates.html",
    "<div class=\"alert alert-info\" ng-hide=\"fundraiser.updates.length > 0\">\n" +
    "  No updates have been published.\n" +
    "</div>\n" +
    "\n" +
    "<table ng-show=\"fundraiser.updates.length > 0\" class=\"table table-striped\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th>Update</th>\n" +
    "      <th>Published</th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "\n" +
    "  <tr ng-repeat=\"update in fundraiser.updates\">\n" +
    "    <td>\n" +
    "      <a ng-href=\"/fundraisers/{{ fundraiser.slug }}/updates/{{ update.id }}\">\n" +
    "        #{{ update.number }} {{ update.title }}\n" +
    "      </a>\n" +
    "    </td>\n" +
    "    <td>\n" +
    "      <div class=\"muted\">{{ update.published_at | date }}</div>\n" +
    "    </td>\n" +
    "  </tr>\n" +
    "</table>"
  );

  $templateCache.put("pages/fundraisers/rewards.html",
    "<div ng-controller=\"FundraisersController\">\n" +
    "  <ul class=\"breadcrumb\">\n" +
    "    <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "    <!--<li><a href=\"/fundraisers\">Fundraisers</a><span class=\"divider\">»</span></li>-->\n" +
    "    <li><a ng-href=\"/fundraisers/{{ fundraiser.id }}\">{{ fundraiser.title || 'Loading...' }}</a><span class=\"divider\">»</span></li>\n" +
    "    <li><a>Rewards</a></li>\n" +
    "  </ul>\n" +
    "\n" +
    "  <div class=\"row-fluid\">\n" +
    "    <div class=\"span9\">\n" +
    "      <div ng-include=\"'pages/fundraisers/partials/header.html'\"></div>\n" +
    "      <div ng-include=\"'pages/fundraisers/partials/nav_tabs.html'\"></div>\n" +
    "\n" +
    "      <div ng-show=\"rewards\">\n" +
    "        <button ng-show=\"expand_all\" class=\"btn\" ng-click=\"toggle_expand_all()\">Collapse All</button>\n" +
    "        <button ng-hide=\"expand_all\" class=\"btn\" ng-click=\"toggle_expand_all()\">Expand All</button>\n" +
    "        <br><br>\n" +
    "      </div>\n" +
    "\n" +
    "      <accordion close-others=\"false\">\n" +
    "        <div ng-repeat=\"reward in rewards | orderBy:'amount'\">\n" +
    "          <div ng-show=\"reward.amount <= 0\">\n" +
    "            <accordion-group heading=\"No Reward\" is-open=\"reward.$is_open\">\n" +
    "              <div class=\"row-fluid\">\n" +
    "                <div class=\"span3\">\n" +
    "                  <dl>\n" +
    "                    <dt>Stats</dt>\n" +
    "                    <dd>{{reward.pledges.length| number}} claimed</dd>\n" +
    "                    <br>\n" +
    "                    <dt>Description</dt>\n" +
    "                    <dd><i>No reward selected</i></dd>\n" +
    "                  </dl>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"span9\">\n" +
    "                  <div ng-show=\"reward.pledges.length <= 0\" class=\"alert alert-info\" style=\"margin: 0\">This reward has not been claimed by a backer.</div>\n" +
    "\n" +
    "                  <table ng-show=\"reward.pledges.length > 0\" class=\"table table-bordered table-striped pledges-table\">\n" +
    "                    <thead>\n" +
    "                    <tr>\n" +
    "                      <th>Backer</th>\n" +
    "                      <th>Amount</th>\n" +
    "                      <th>Date</th>\n" +
    "                    </tr>\n" +
    "                    </thead>\n" +
    "                    <tbody>\n" +
    "                    <tr ng-repeat=\"pledge in reward.pledges\">\n" +
    "                      <td>\n" +
    "                        <a ng-show=\"pledge.person\" ng-href=\"/people/{{ pledge.person.slug }}\">{{ pledge.person.display_name }}</a>\n" +
    "                        <div ng-hide=\"pledge.person\" class=\"muted\">Anonymous</div>\n" +
    "                      </td>\n" +
    "                      <td>{{ pledge.amount | currency }}</td>\n" +
    "                      <td>{{ pledge.created_at | date:'medium' }}</td>\n" +
    "                    </tr>\n" +
    "                    </tbody>\n" +
    "                  </table>\n" +
    "                </div>\n" +
    "              </div>\n" +
    "            </accordion-group>\n" +
    "          </div>\n" +
    "\n" +
    "          <div ng-show=\"reward.amount > 0\">\n" +
    "            <accordion-group heading=\"${{reward.amount | number:0}} Reward\" is-open=\"reward.$is_open\">\n" +
    "              <div class=\"row-fluid\">\n" +
    "                <div class=\"span3\">\n" +
    "                  <dl>\n" +
    "                    <dt>Stats</dt>\n" +
    "                    <dd ng-show=\"reward.limited_to\">{{reward.pledges.length| number}} of {{reward.limited_to | number}} claimed</dd>\n" +
    "                    <dd ng-hide=\"reward.limited_to\">{{reward.pledges.length| number}} claimed</dd>\n" +
    "                    <br>\n" +
    "                    <dt>Description</dt>\n" +
    "                    <dd style=\"white-space: pre-wrap\">{{reward.description}}</dd>\n" +
    "                    <div ng-show=\"reward.fulfillment_details\">\n" +
    "                      <br>\n" +
    "                      <dt>Fulfillment Details</dt>\n" +
    "                      <dd style=\"white-space: pre-wrap\">{{reward.fulfillment_details}}</dd>\n" +
    "                    </div>\n" +
    "                  </dl>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"span9\">\n" +
    "                  <div ng-show=\"reward.pledges.length <= 0\" class=\"alert alert-info\" style=\"margin: 0\">This reward has not been claimed by a backer.</div>\n" +
    "\n" +
    "                  <table ng-show=\"reward.pledges.length > 0\" class=\"table table-bordered table-striped pledges-table\">\n" +
    "                    <thead>\n" +
    "                      <tr>\n" +
    "                        <th>Backer</th>\n" +
    "                        <th>Amount</th>\n" +
    "                        <th>Date</th>\n" +
    "                        <th ng-show=\"reward.fulfillment_details\">Survey Response</th>\n" +
    "                      </tr>\n" +
    "                    </thead>\n" +
    "                    <tbody>\n" +
    "                      <tr ng-repeat=\"pledge in reward.pledges\">\n" +
    "                        <td>\n" +
    "                          <a ng-show=\"pledge.person\" ng-href=\"/people/{{ pledge.person.slug }}\">{{ pledge.person.display_name }}</a>\n" +
    "                          <div ng-hide=\"pledge.person\" class=\"muted\">Anonymous</div>\n" +
    "                        </td>\n" +
    "                        <td>{{ pledge.amount | currency }}</td>\n" +
    "                        <td>{{ pledge.created_at | date:'medium' }}</td>\n" +
    "                        <td ng-show=\"reward.fulfillment_details\">\n" +
    "                          <div ng-class=\"{ error: (reward.fulfillment_details && !pledge.survey_response) }\" style=\"white-space: pre-wrap\">{{pledge.survey_response}}</div>\n" +
    "                        </td>\n" +
    "                      </tr>\n" +
    "                    </tbody>\n" +
    "                  </table>\n" +
    "                </div>\n" +
    "              </div>\n" +
    "            </accordion-group>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </accordion>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"span3\">\n" +
    "      <div ng-include=\"'pages/fundraisers/partials/manage.html'\"></div>\n" +
    "      <div ng-include=\"'pages/fundraisers/partials/about_me.html'\"></div>\n" +
    "      <div ng-include=\"'pages/fundraisers/partials/progress_small.html'\"></div>\n" +
    "      <div ng-include=\"'pages/fundraisers/partials/pledge_button.html'\"></div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "</div>"
  );

  $templateCache.put("pages/fundraisers/show.html",
    "<div ng-controller=\"FundraisersController\">\n" +
    "  <ul class=\"breadcrumb\">\n" +
    "    <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "    <!--<li><a href=\"/fundraisers\">Fundraisers</a><span class=\"divider\">»</span></li>-->\n" +
    "    <li><a href=\"/fundraisers/{{fundraiser.id}}\">{{ fundraiser.title || 'Loading...' }}</a></li>\n" +
    "  </ul>\n" +
    "\n" +
    "  <form class=\"form\" ng-show=\"fundraiser\">\n" +
    "    <div class=\"row-fluid\">\n" +
    "      <div class=\"span9\">\n" +
    "        <div ng-include=\"'pages/fundraisers/partials/header.html'\"></div>\n" +
    "        <div ng-include=\"'pages/fundraisers/partials/nav_tabs.html'\"></div>\n" +
    "        <div ng-include=\"'pages/fundraisers/partials/progress.html'\"></div>\n" +
    "        <hr>\n" +
    "        <div ng-bind-html-unsafe=\"sanitized_description\"></div>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"span3\">\n" +
    "        <div ng-include=\"'pages/fundraisers/partials/manage.html'\"></div>\n" +
    "\n" +
    "        <h3 style=\"margin-top: 0\">By <a ng-href=\"/people/{{fundraiser.person.slug}}\">{{ fundraiser.person.display_name }}</a></h3>\n" +
    "        <div ng-include=\"'pages/fundraisers/partials/about_me.html'\"></div>\n" +
    "\n" +
    "        <div ng-include=\"'pages/fundraisers/partials/pledge_button.html'\"></div>\n" +
    "\n" +
    "        <div ng-show=\"fundraiser.rewards.length > 0\">\n" +
    "          <h3>Rewards</h3>\n" +
    "          <div ng-include=\"'pages/fundraisers/partials/rewards.html'\"></div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>"
  );

  $templateCache.put("pages/fundraisers/updates.html",
    "<div ng-controller=\"FundraisersController\">\n" +
    "  <ul class=\"breadcrumb\">\n" +
    "    <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "    <!--<li><a href=\"/fundraisers\">Fundraisers</a><span class=\"divider\">»</span></li>-->\n" +
    "    <li><a ng-href=\"/fundraisers/{{ fundraiser.id }}\">{{ fundraiser.title || 'Loading...' }}</a><span class=\"divider\">»</span></li>\n" +
    "    <li><a>Updates</a></li>\n" +
    "  </ul>\n" +
    "\n" +
    "  <form class=\"form\" ng-show=\"fundraiser\">\n" +
    "    <div class=\"row-fluid\">\n" +
    "      <div class=\"span9\">\n" +
    "        <div ng-include=\"'pages/fundraisers/partials/header.html'\"></div>\n" +
    "        <div ng-include=\"'pages/fundraisers/partials/nav_tabs.html'\"></div>\n" +
    "\n" +
    "        <div ng-show=\"can_manage\" class=\"hero-unit\">\n" +
    "          <h2>Updates</h2>\n" +
    "          <p>Publish updates about your fundraiser. Published updates are emailed to the backers of your fundraiser.</p>\n" +
    "          <button ng-controller=\"FundraiserUpdatesController\" ng-click=\"create_update()\" class=\"btn btn-large btn-primary\">New Update</button>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"alert alert-info\" ng-show=\"updates.length <= 0\">\n" +
    "          No updates have been published.\n" +
    "        </div>\n" +
    "\n" +
    "        <table class=\"table table-striped\" ng-show=\"updates.length > 0\">\n" +
    "          <!--Published updates row-->\n" +
    "          <tr ng-repeat=\"update in updates\">\n" +
    "            <td>\n" +
    "              <a ng-show=\"update.published_at\" ng-href=\"/fundraisers/{{ fundraiser.slug }}/updates/{{ update.id }}\">#{{ update.number }} {{ update.title }}</a>\n" +
    "\n" +
    "              <div ng-hide=\"update.published_at\">\n" +
    "                <a class=\"label label-info\" ng-href=\"/fundraisers/{{ fundraiser.slug }}/updates/{{ update.id }}\">Draft</a>\n" +
    "                <a ng-href=\"/fundraisers/{{ fundraiser.slug }}/updates/{{ update.id }}\">{{ update.title || 'Untitled' }}</a>\n" +
    "              </div>\n" +
    "            </td>\n" +
    "            <td>\n" +
    "              <div ng-show=\"update.published_at\" class=\"muted\">Published {{ update.published_at | date }}</div>\n" +
    "              <div ng-hide=\"update.published_at\" class=\"muted\">Last modified {{ update.published_at | date }}</div>\n" +
    "            </td>\n" +
    "          </tr>\n" +
    "        </table>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"span3\">\n" +
    "        <div ng-include=\"'pages/fundraisers/partials/manage.html'\"></div>\n" +
    "        <div ng-include=\"'pages/fundraisers/partials/about_me.html'\"></div>\n" +
    "        <div ng-include=\"'pages/fundraisers/partials/progress_small.html'\"></div>\n" +
    "        <div ng-include=\"'pages/fundraisers/partials/pledge_button.html'\"></div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "\n" +
    "</div>"
  );

  $templateCache.put("pages/home/home.html",
    "<div class=\"homepage\">\n" +
    "  <section id=\"top\">\n" +
    "    <div class=\"container\">\n" +
    "      <h1><img src=\"/images/Bountysource-white.png\" style=\"padding-bottom:5px\"> is the funding platform for open-source software.</h1>\n" +
    "      <h2>Accelerate open-source development with our community.</h2>\n" +
    "\n" +
    "      <a class=\"btn btn-info btn-large\" href=\"/learn\" style=\"margin-right: 10px; width: 100px\">Learn More</a>\n" +
    "      <a class=\"btn btn-info btn-large\" href=\"/signin\" style=\"margin-left: 10px; width: 100px\" ng-hide=\"current_person\">Sign Up</a>\n" +
    "    </div>\n" +
    "  </section>\n" +
    "\n" +
    "  <section id=\"users\">\n" +
    "    <div class=\"container\">\n" +
    "      <h3 class=\"text-center\" style=\"margin: 0\">Top Developers</h3>\n" +
    "      <ul class=\"inline\">\n" +
    "        <li ng-repeat=\"person in people.developers.top.slice(0,18)\">\n" +
    "          <a ng-href=\"/people/{{person.slug}}\"><img class=\"thumbnail\" style=\"width: 45px; height: 45px\" ng-src=\"{{person.image_url}}\"></a>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "      <h3 class=\"text-center\" style=\"margin: 0\">Top Backers</h3>\n" +
    "      <ul class=\"inline\">\n" +
    "        <li ng-repeat=\"person in people.backers.top.slice(0,18)\">\n" +
    "          <a ng-href=\"/people/{{person.slug}}\"><img class=\"thumbnail\" style=\"width: 45px; height: 45px\" ng-src=\"{{person.image_url}}\"></a>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "  </section>\n" +
    "\n" +
    "  <section id=\"fundraisers\">\n" +
    "    <div class=\"container\">\n" +
    "      <h3 class=\"text-center\">Featured Fundraisers</h3>\n" +
    "      <div class=\"row-fluid\">\n" +
    "        <div class=\"span6\">\n" +
    "          <fundraiser-card ng-repeat=\"fundraiser in fundraisers | orderBy:'-created_at' | slice:0:3\" fundraiser=\"fundraiser\"></fundraiser-card>\n" +
    "        </div>\n" +
    "        <div class=\"span6\">\n" +
    "          <fundraiser-card ng-repeat=\"fundraiser in fundraisers | orderBy:'-created_at' | slice:3:6\" fundraiser=\"fundraiser\"></fundraiser-card>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </section>\n" +
    "\n" +
    "  <section id=\"projects\">\n" +
    "    <div class=\"container\">\n" +
    "      <h3 class=\"text-center\">Top Projects</h3>\n" +
    "      <div class=\"row-fluid\">\n" +
    "        <div class=\"span6\">\n" +
    "          <project-card ng-repeat=\"project in trackers | orderBy:'-bounty_total' | slice:0:3\" project=\"project\"></project-card>\n" +
    "        </div>\n" +
    "        <div class=\"span6\">\n" +
    "          <project-card ng-repeat=\"project in trackers | orderBy:'-bounty_total' | slice:3:6\" project=\"project\"></project-card>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </section>\n" +
    "</div>"
  );

  $templateCache.put("pages/home/search.html",
    "<ul class=\"breadcrumb\">\n" +
    "  <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a>Search</a></li>\n" +
    "</ul>\n" +
    "\n" +
    "<h2>Search</h2>\n" +
    "<hr>\n" +
    "\n" +
    "<div ng-hide=\"search_query_submitted\">\n" +
    "  <form ng-submit=\"submit_search()\">\n" +
    "    <input type=\"text\" class=\"search-query span4\" ng-model=\"search_query\" placeholder=\"Issue URL, Project, Language, etc.\">\n" +
    "    <button type=\"submit\" class=\"btn btn-primary\" ng-disabled=\"!search_query\"><i class=\"icon-search icon-white\"></i> Search</button>\n" +
    "  </form>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"text-center\" collapse=\"!search_query_submitted || !search_pending\">\n" +
    "  <p class=\"lead\">Searching for '{{search_query}}'...</p>\n" +
    "  <progress value=\"100\" class=\"progress-striped active\"></progress>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row-fluid\" collapse=\"!search_query_submitted || search_pending\">\n" +
    "  <div class=\"span3\">\n" +
    "    <div collapse=\"search_pending\">\n" +
    "      <div class=\"well\">\n" +
    "        <input style=\"margin: 0\" type=\"text\" class=\"span12\" ng-model=\"search_filter\" placeholder=\"Filter search results...\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div collapse=\"search_pending\">\n" +
    "      <div class=\"well text-center\">\n" +
    "        <div><strong>Don't see what you're looking for?</strong></div>\n" +
    "        <br>\n" +
    "        <a class=\"btn btn-block\" href=\"/issues/new\">Add an Issue</a>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"span9\">\n" +
    "    <div>\n" +
    "      <div class=\"row-fluid\">\n" +
    "        <div class=\"span6\">\n" +
    "          <table class=\"table table-striped table-hover\">\n" +
    "            <thead>\n" +
    "            <tr>\n" +
    "              <th>Projects <span class=\"label label-info\">{{results.trackers.length | number}}</span></th>\n" +
    "            </tr>\n" +
    "            </thead>\n" +
    "\n" +
    "            <tbody>\n" +
    "            <tr ng-show=\"results.trackers.length == 0\" class=\"text-info\">\n" +
    "              <td><i>No projects found</i></td>\n" +
    "            </tr>\n" +
    "            <tr ng-repeat=\"tracker in results.trackers | filter:filter_search_results | orderBy:'-bounty_total'\">\n" +
    "              <td><a ng-href=\"/trackers/{{tracker.slug}}\">{{tracker.name}}</a></td>\n" +
    "            </tr>\n" +
    "            </tbody>\n" +
    "          </table>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"span6\">\n" +
    "          <table class=\"table table-striped table-hover\">\n" +
    "            <thead>\n" +
    "            <tr>\n" +
    "              <th>Issues <span class=\"label label-info\">{{results.issues.length | number}}</span></th>\n" +
    "            </tr>\n" +
    "            </thead>\n" +
    "\n" +
    "            <tbody>\n" +
    "            <tr ng-show=\"results.issues.length == 0\" class=\"text-info\">\n" +
    "              <td><i>No issues found</i></td>\n" +
    "            </tr>\n" +
    "            <tr ng-repeat=\"issue in results.issues | filter:filter_search_results | orderBy:'-bounty_total'\">\n" +
    "              <td><a ng-href=\"/issues/{{issue.slug}}\">{{issue.title}}</a></td>\n" +
    "            </tr>\n" +
    "            </tbody>\n" +
    "          </table>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );

  $templateCache.put("pages/issues/bounties.html",
    "<div ng-controller=\"IssueShow\">\n" +
    "  <ul class=\"breadcrumb\">\n" +
    "    <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "    <li><a ng-href=\"/trackers/{{issue.tracker.slug}}\">{{issue.tracker.name || 'Loading...'}}</a><span class=\"divider\">»</span></li>\n" +
    "    <li><a ng-href=\"/issues/{{issue.slug}}\">{{issue.title ||'Loading...'}}</a></li>\n" +
    "  </ul>\n" +
    "\n" +
    "  <div class=\"row-fluid\" ng-show=\"issue\">\n" +
    "    <div class=\"span9\">\n" +
    "      <div ng-include=\"'pages/issues/partials/header.html'\"></div>\n" +
    "      <div ng-include=\"'pages/issues/partials/nav_tabs.html'\"></div>\n" +
    "\n" +
    "      <div class=\"alert alert-info\" ng-hide=\"issue.bounties.length > 0\">\n" +
    "        No bounties have been placed.\n" +
    "      </div>\n" +
    "\n" +
    "      <div ng-show=\"issue.bounties.length > 0\">\n" +
    "        <table id=\"bounties-table\" class=\"table table-striped\">\n" +
    "          <thead>\n" +
    "          <tr>\n" +
    "            <th><a ng-click=\"sort_by('person.display_name')\">Backer</a></th>\n" +
    "            <th></th>\n" +
    "            <th><a ng-click=\"sort_by('amount')\">Amount</a></th>\n" +
    "            <th><a ng-click=\"sort_by('created_at')\">Date</a></th>\n" +
    "          </tr>\n" +
    "          </thead>\n" +
    "          <tbody>\n" +
    "          <tr ng-repeat=\"bounty in issue.bounties | orderBy:sort_column:sort_reverse\">\n" +
    "            <td>\n" +
    "              <img ng-show=\"bounty.person\" class=\"thumbnail\" ng-src=\"{{ bounty.person.image_url }}\">\n" +
    "              <img ng-hide=\"bounty.person\" class=\"thumbnail\" src=\"images/anon.jpg\">\n" +
    "            </td>\n" +
    "            <td>\n" +
    "              <a ng-show=\"bounty.person\" ng-href=\"/people/{{ bounty.person.slug }}\">{{ bounty.person.display_name }}</a>\n" +
    "              <div ng-hide=\"bounty.person\">Anonymous</div>\n" +
    "            </td>\n" +
    "            <td>\n" +
    "              <div><strong>{{ bounty.amount | dollars }}</strong></div>\n" +
    "            </td>\n" +
    "            <td>\n" +
    "              <div class=\"muted\">{{ bounty.created_at | date }}</div>\n" +
    "            </td>\n" +
    "          </tr>\n" +
    "          </tbody>\n" +
    "        </table>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"span3\">\n" +
    "      <div ng-include=\"'pages/issues/partials/bounty_box.html'\"></div>\n" +
    "      <div ng-include=\"'pages/issues/partials/developer_box.html'\"></div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );

  $templateCache.put("pages/issues/comments.html",
    "<div ng-controller=\"IssueShow\">\n" +
    "  <ul class=\"breadcrumb\">\n" +
    "    <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "    <li><a ng-href=\"/trackers/{{issue.tracker.slug}}\">{{issue.tracker.name || 'Loading...'}}</a><span class=\"divider\">»</span></li>\n" +
    "    <li><a ng-href=\"/issues/{{issue.slug}}\">{{issue.title ||'Loading...'}}</a></li>\n" +
    "  </ul>\n" +
    "\n" +
    "  <div class=\"row-fluid\" ng-show=\"issue\">\n" +
    "    <div class=\"span9\">\n" +
    "      <div ng-include=\"'pages/issues/partials/header.html'\"></div>\n" +
    "      <div ng-include=\"'pages/issues/partials/nav_tabs.html'\"></div>\n" +
    "\n" +
    "      <div class=\"alert alert-info\">Have something to say? <a ng-href=\"{{issue.url}}\" target=\"_blank\">Join the conversation</a></div>\n" +
    "\n" +
    "      <div class=\"alert alert-info\" ng-hide=\"issue.comments.length > 0\">\n" +
    "        No comments have been made.\n" +
    "      </div>\n" +
    "      <table class=\"table table-striped\">\n" +
    "        <tbody>\n" +
    "        <tr ng-repeat=\"comment in issue.comments\">\n" +
    "          <td class=\"span2\"><img ng-src=\"{{comment.author_image_url}}\" class=\"thumbnail span12\"></td>\n" +
    "          <td class=\"span10\">\n" +
    "            <p class=\"muted\">{{comment.author_name}} on {{comment.created_at | date}}</p>\n" +
    "            <div ng-bind-html=\"comment.body_html\"></div>\n" +
    "          </td>\n" +
    "        </tr>\n" +
    "        </tbody>\n" +
    "      </table>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"span3\">\n" +
    "      <div ng-include=\"'pages/issues/partials/bounty_box.html'\"></div>\n" +
    "      <div ng-include=\"'pages/issues/partials/developer_box.html'\"></div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );

  $templateCache.put("pages/issues/new.html",
    "<ul class=\"breadcrumb\">\n" +
    "  <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a>Add Issue by URL</a></li>\n" +
    "</ul>\n" +
    "\n" +
    "<div ng-show=\"error\">\n" +
    "  <alert type=\"'error'\" close=\"error = null\">{{error}}</alert>\n" +
    "</div>\n" +
    "\n" +
    "<form class=\"form-horizontal\" name=\"form\">\n" +
    "  <div class=\"control-group\">\n" +
    "    <label class=\"control-label\" for=\"issue_url\">Issue URL</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <input type=\"url\" id=\"issue_url\" ng-model=\"new_issue.issue_url\" class=\"span8\" placeholder=\"https://trac.someproject.com/ticket/123\" required=\"\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <label class=\"control-label\" for=\"title\">Issue Title</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <input type=\"text\" id=\"title\" ng-model=\"new_issue.title\" class=\"span8\" placeholder=\"Title of the issue\" required=\"\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <label class=\"control-label\" for=\"number\">Issue Number</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <input type=\"text\" id=\"number\" ng-model=\"new_issue.number\" class=\"span2\" placeholder=\"Issue number\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <br>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <label class=\"control-label\" for=\"project_name\">Project Name</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <input type=\"text\" id=\"project_name\" ng-model=\"new_issue.project_name\" class=\"span8\" placeholder=\"Name of the project\" required=\"\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <label class=\"control-label\" for=\"project_url\">Project Tracker URL</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <input type=\"text\" id=\"project_url\" ng-model=\"new_issue.project_url\" class=\"span8\" placeholder=\"https://trac.someproject.com/\" required=\"\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <div class=\"controls\">\n" +
    "      <button class=\"btn btn-large btn-primary\" ng-disabled=\"form.$invalid\" ng-click=\"create_issue()\">Add Issue</button>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</form>"
  );

  $templateCache.put("pages/issues/partials/bounty_box.html",
    "<div class=\"well obama-buttons\" ng-show=\"issue.can_add_bounty || issue.bounty_total > 0\" ng-controller=\"IssueShow\">\n" +
    "  <div style=\"text-align: center\">\n" +
    "    <h2 style=\"margin: 0\">{{issue.bounty_total | dollars}}</h2>\n" +
    "    <div ng-show=\"issue.bounties.length == 1\">from 1 bounty</div>\n" +
    "    <div ng-hide=\"issue.bounties.length == 1\">from {{issue.bounties.length | number}} bounties</div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"controls controls-row\">\n" +
    "    <button ng-click=\"bounty.amount = 15\" ng-disabled=\"bounty.amount==15\" class=\"span4 btn btn-primary btn-block\" type=\"button\">$15</button>\n" +
    "    <button ng-click=\"bounty.amount = 35\" ng-disabled=\"bounty.amount==35\" class=\"span4 btn btn-primary btn-block\" type=\"button\">$35</button>\n" +
    "    <button ng-click=\"bounty.amount = 50\" ng-disabled=\"bounty.amount==50\" class=\"span4 btn btn-primary btn-block\" type=\"button\">$50</button>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"controls controls-row\">\n" +
    "    <button ng-click=\"bounty.amount = 100\" ng-disabled=\"bounty.amount==100\" class=\"span4 btn btn-primary btn-block\" type=\"button\">$100</button>\n" +
    "    <button ng-click=\"bounty.amount = 250\" ng-disabled=\"bounty.amount==250\" class=\"span4 btn btn-primary btn-block\" type=\"button\">$250</button>\n" +
    "    <button ng-click=\"bounty.amount = 500\" ng-disabled=\"bounty.amount==500\" class=\"span4 btn btn-primary btn-block\" type=\"button\">$500</button>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"controls controls-row\">\n" +
    "    <button class=\"span4 btn btn-primary btn-block\" ng-disabled=\"bounty.amount==1000\" ng-click=\"bounty.amount = 1000\">$1000</button>\n" +
    "    <input type=\"number\" min=\"5\" ng-model=\"bounty.amount\" class=\"span8 input-small\" placeholder=\"Other amount\" tooltip=\"$5 minimum bounty\" tooltip-placement=\"bottom\" toolip-trigger=\"focus\">\n" +
    "  </div>\n" +
    "\n" +
    "  <div collapse=\"!bounty.amount || bounty.amount <= 0\">\n" +
    "    <br>\n" +
    "    <label class=\"radio\" style=\"margin-left: 5px\">\n" +
    "      <input type=\"radio\" ng-model=\"bounty.payment_method\" value=\"google\" selected=\"selected\">\n" +
    "      <img src=\"images/google-wallet.png\">\n" +
    "      Google Wallet\n" +
    "    </label>\n" +
    "\n" +
    "    <label class=\"radio\" style=\"margin-left: 5px\">\n" +
    "      <input type=\"radio\" ng-model=\"bounty.payment_method\" value=\"paypal\">\n" +
    "      <img src=\"images/paypal.png\">\n" +
    "      PayPal\n" +
    "    </label>\n" +
    "\n" +
    "    <!--<label class=\"radio\" style=\"margin-left: 5px;\">-->\n" +
    "    <!--<input type=\"radio\" ng-model=\"bounty.payment_method\" value=\"gittip\" />-->\n" +
    "    <!--<img src=\"images/gittip.png\">-->\n" +
    "    <!--Gittip-->\n" +
    "    <!--</label>-->\n" +
    "\n" +
    "    <label class=\"radio\" ng-show=\"current_person && current_person.account.balance > 0\" style=\"margin-left: 5px\">\n" +
    "      <input type=\"radio\" ng-model=\"bounty.payment_method\" value=\"personal\">\n" +
    "      <img src=\"favicon.ico\">\n" +
    "      Bountysource {{ current_person.account.balance | currency }}\n" +
    "    </label>\n" +
    "\n" +
    "    <label class=\"checkbox\" style=\"margin-left: 5px\">\n" +
    "      Make anonymous\n" +
    "      <input type=\"checkbox\" id=\"anonymous\" ng-model=\"bounty.anonymous\">\n" +
    "    </label>\n" +
    "\n" +
    "    <br>\n" +
    "    <button ng-click=\"create_payment()\" class=\"btn btn-block btn-large btn-success\">Create ${{bounty.amount | number:0}} Bounty</button>\n" +
    "  </div>\n" +
    "</div>"
  );

  $templateCache.put("pages/issues/partials/developer_box.html",
    "<div ng-controller=\"DeveloperBoxController\">\n" +
    "  <div ng-show=\"issue.accepted_solution\" class=\"well text-center\">\n" +
    "    <h3 style=\"margin: 0\">Bounty Claimed</h3>\n" +
    "    <p><a ng-href=\"/people/{{issue.accepted_solution.person.slug}}\">{{issue.accepted_solution.person.display_name}}</a> claimed the bounty.</p>\n" +
    "\n" +
    "    <!--<a class=\"thumbnail\" ng-href=\"/people/{{issue.accepted_solution.person.slug}}\"><img ng-src=\"{{issue.accepted_solution.person.image_url}}\" /></a>-->\n" +
    "    <!--<br />-->\n" +
    "\n" +
    "    <a ng-href=\"{{issue.accepted_solution.code_url}}\" target=\"_blank\" class=\"btn btn-block\">\n" +
    "      <i class=\"icon-globe\"></i>\n" +
    "      View Submission\n" +
    "    </a>\n" +
    "    <a ng-href=\"/issues/{{issue.slug}}/solutions\" class=\"btn btn-block\">\n" +
    "      <i class=\"icon-list\"></i>\n" +
    "      View All Solutions\n" +
    "    </a>\n" +
    "  </div>\n" +
    "\n" +
    "  <div ng-show=\"!issue.accepted_solution && (issue.can_add_bounty || issue.bounty_total > 0)\">\n" +
    "    <div ng-show=\"issue.my_solution\" class=\"well\">\n" +
    "      <div class=\"text-center\">\n" +
    "        <div ng-show=\"!issue.my_solution.submitted\">\n" +
    "          <h3 style=\"margin: 0\" class=\"text-center\">Earn the Bounty</h3>\n" +
    "          <p class=\"text-info\">Have you finished your solution? If so, you need to submit it!</p>\n" +
    "          <a ng-href=\"/issues/{{issue.slug}}/solutions\" class=\"btn btn-block btn-primary\">Update Solution</a>\n" +
    "        </div>\n" +
    "\n" +
    "        <div ng-show=\"issue.my_solution.submitted && !issue.my_solution.accepted\">\n" +
    "          <h3 style=\"margin: 0\" class=\"text-center\">Earn the Bounty</h3>\n" +
    "          <p class=\"text-info\">Your solution has been submitted.</p>\n" +
    "          <a ng-href=\"/issues/{{issue.slug}}/solutions\" class=\"btn btn-block btn-info\">Check Status</a>\n" +
    "        </div>\n" +
    "\n" +
    "        <div ng-show=\"issue.my_solution.accepted && !issue.my_solution.paid_out\">\n" +
    "          <h3 style=\"margin: 0\" class=\"text-center\">Earn the Bounty</h3>\n" +
    "          <p class=\"text-success\">Your solution was accepted!</p>\n" +
    "          <a ng-href=\"/issues/{{issue.slug}}/solutions\" class=\"btn btn-block btn-large btn-success\">Claim Bounty</a>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-hide=\"issue.my_solution\" class=\"well\">\n" +
    "      <div class=\"text-center\">\n" +
    "        <h3 style=\"margin: 0\">Earn the Bounty</h3>\n" +
    "        <p>Working on a solution to this issue? Let us know! If your solution is accepted, you are awarded the bounty.</p>\n" +
    "      </div>\n" +
    "      <button ng-click-require-auth=\"issue.create_solution()\" class=\"btn btn-block\">Start Work</button>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );

  $templateCache.put("pages/issues/partials/header.html",
    "<div class=\"row-fluid\">\n" +
    "  <div class=\"span1\">\n" +
    "    <a ng-href=\"/trackers/{{issue.tracker.slug}}\"><img ng-src=\"{{issue.tracker.image_url}}\" class=\"thumbnail\"></a>\n" +
    "  </div>\n" +
    "  <div class=\"span11\">\n" +
    "    <h4 style=\"margin-top: 0\">{{ issue.title || 'Loading...' }}</h4>\n" +
    "    <span ng-show=\"issue.can_add_bounty\" class=\"label label-success\">Issue Open</span>\n" +
    "    <span ng-hide=\"issue.can_add_bounty\" class=\"label label-important\">Issue Closed</span>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<br>"
  );

  $templateCache.put("pages/issues/partials/my_solution_box.html",
    "<div ng-show=\"issue.my_solution\">\n" +
    "  <div class=\"well\">\n" +
    "    <p class=\"lead text-center\">{{ issue.my_solution | solution_progress_description }}</p>\n" +
    "\n" +
    "    <form name=\"submit_solution\" ng-show=\"!issue.my_solution.submitted\" class=\"form-horizontal\">\n" +
    "      <p class=\"text-center\"><strong>Ready to submit your solution?</strong> Provide the URL to your code, as well as a brief description of how it resolves the issue.</p>\n" +
    "      <br>\n" +
    "\n" +
    "      <div class=\"control-group\">\n" +
    "        <label class=\"control-label\" for=\"code_url\">Code URL</label>\n" +
    "        <div class=\"controls\">\n" +
    "          <input class=\"span10\" type=\"url\" id=\"code_url\" ng-model=\"my_solution_submit.code_url\" placeholder=\"https://github.com/bountysource/frontend/pulls/1\">\n" +
    "        </div>\n" +
    "      </div>\n" +
    "      <div class=\"control-group\">\n" +
    "        <label class=\"control-label\" for=\"body\">Description</label>\n" +
    "        <div class=\"controls\">\n" +
    "          <textarea class=\"span10\" id=\"body\" rows=\"4\" ng-model=\"my_solution_submit.body\" placeholder=\"I implemented quicksort in lua.\"></textarea>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "      <div class=\"control-group\">\n" +
    "        <div class=\"controls\">\n" +
    "          <button type=\"submit\" class=\"btn btn-primary\" ng-disabled=\"submit_solution.$invalid\" ng-click=\"issue.my_solution.submit()\">Submit Solution</button>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </form>\n" +
    "\n" +
    "    <div ng-show=\"issue.my_solution.accepted && issue.my_solution.paid_out\">\n" +
    "\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-show=\"issue.my_solution.accepted && !issue.my_solution.paid_out\">\n" +
    "      <div class=\"row-fluid\">\n" +
    "        <div class=\"span6\">\n" +
    "          <form name=\"claim_bounty\" ng-show=\"issue.my_solution.accepted\" class=\"form-horizontal\">\n" +
    "            <div class=\"control-group\">\n" +
    "              <label class=\"control-label\" for=\"code_url\">Total Bounty</label>\n" +
    "              <div class=\"controls\">\n" +
    "                <div class=\"input-prepend\">\n" +
    "                  <div class=\"add-on\">$</div>\n" +
    "                  <input type=\"text\" value=\"{{bounty_claim.bounty_total | dollars}}\" disabled=\"disabled\">\n" +
    "                </div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"control-group\">\n" +
    "              <label class=\"control-label\" for=\"code_url\">Donations</label>\n" +
    "              <div class=\"controls\">\n" +
    "                <label class=\"inline\">\n" +
    "                  <input type=\"number\" name=\"eff\" class=\"span6\" min=\"0\" max=\"{{issue.bounty_total}}\" ng-model=\"bounty_claim.donations.eff.amount\" ng-change=\"update_bounty_claim()\" ng-focus=\"charity_focus(bounty_claim.donations.eff)\" ng-blur=\"charity_blur(bounty_claim.donations.eff)\">\n" +
    "                  <span class=\"badge badge-success\">EFF</span>\n" +
    "                </label>\n" +
    "\n" +
    "                <label class=\"inline\">\n" +
    "                  <input type=\"number\" class=\"span6\" min=\"0\" max=\"{{issue.bounty_total}}\" ng-model=\"bounty_claim.donations.fsf.amount\" ng-change=\"update_bounty_claim()\" ng-focus=\"charity_focus(bounty_claim.donations.fsf)\" ng-blur=\"charity_blur(bounty_claim.donations.fsf)\">\n" +
    "                  <span class=\"badge badge-success\">FSF</span>\n" +
    "                </label>\n" +
    "\n" +
    "                <label class=\"inline\">\n" +
    "                  <input type=\"number\" class=\"span6\" min=\"0\" max=\"{{issue.bounty_total}}\" ng-model=\"bounty_claim.donations.spi.amount\" ng-change=\"update_bounty_claim()\" ng-focus=\"charity_focus(bounty_claim.donations.spi)\" ng-blur=\"charity_blur(bounty_claim.donations.spi)\">\n" +
    "                  <span class=\"badge badge-success\">SPI</span>\n" +
    "                </label>\n" +
    "\n" +
    "                <label class=\"inline\">\n" +
    "                  <input type=\"number\" class=\"span6\" min=\"0\" max=\"{{issue.bounty_total}}\" ng-model=\"bounty_claim.donations.dwb.amount\" ng-change=\"update_bounty_claim()\" ng-focus=\"charity_focus(bounty_claim.donations.dwb)\" ng-blur=\"charity_blur(bounty_claim.donations.dwb)\">\n" +
    "                  <span class=\"badge badge-success\">DWB</span>\n" +
    "                </label>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"control-group\">\n" +
    "              <label class=\"control-label\" for=\"code_url\">Donation</label>\n" +
    "              <div class=\"controls\">\n" +
    "                <div class=\"input-prepend\">\n" +
    "                  <div class=\"add-on\">$</div>\n" +
    "                  <input type=\"text\" value=\"{{bounty_claim.donation_total | dollars}}\" disabled=\"disabled\">\n" +
    "                </div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"control-group\">\n" +
    "              <label class=\"control-label\" for=\"code_url\">Your Cut</label>\n" +
    "              <div class=\"controls\">\n" +
    "                <div class=\"input-prepend\">\n" +
    "                  <div class=\"add-on\">$</div>\n" +
    "                  <input type=\"text\" value=\"{{bounty_claim.your_cut | dollars}}\" disabled=\"disabled\">\n" +
    "                </div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"control-group\">\n" +
    "              <div class=\"controls\">\n" +
    "                <button type=\"submit\" class=\"btn btn-success\" ng-disabled=\"claim_bounty.$invalid\" ng-click=\"issue.my_solution.claim_bounty()\">Collect Bounty</button>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "          </form>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"span5 offset1\">\n" +
    "          <div collapse=\"!bounty_claim.donations.eff.$show_info\">\n" +
    "            <h4>\n" +
    "              <a href=\"https://www.eff.org/\" target=\"_blank\">Electronic Frontier Foundation</a>\n" +
    "            </h4>\n" +
    "            <p>EFF is a donor-funded nonprofit and depends on your support to continue successfully defending your digital rights. Litigation is particularly expensive; because two-thirds of our budget comes from individual donors, every contribution is critical to helping EFF fight—and win—more cases.</p>\n" +
    "          </div>\n" +
    "\n" +
    "          <div collapse=\"!bounty_claim.donations.fsf.$show_info\">\n" +
    "            <h4>\n" +
    "              <a href=\"https://www.fsf.org/\" target=\"_blank\">Free Software Foundation</a>\n" +
    "            </h4>\n" +
    "            <p>The Free Software Foundation (FSF) is a nonprofit with a worldwide mission to promote computer user freedom and to defend the rights of all free software users.</p>\n" +
    "          </div>\n" +
    "\n" +
    "          <div collapse=\"!bounty_claim.donations.spi.$show_info\">\n" +
    "            <h4>\n" +
    "              <a href=\"http://www.spi-inc.org/\" target=\"_blank\">Software in the Public Interest</a>\n" +
    "            </h4>\n" +
    "            <p>SPI is a non-profit organization which was founded to help organizations develop and distribute open hardware and software. We encourage programmers to use the GNU General Public License or other licenses that allow free redistribution and use of software, and hardware developers to distribute documentation that will allow device drivers to be written for their product.</p>\n" +
    "          </div>\n" +
    "\n" +
    "          <div collapse=\"!bounty_claim.donations.dwb.$show_info\">\n" +
    "            <h4>\n" +
    "              <a href=\"https://www.doctorswithoutborders.org/\" target=\"_blank\">Doctors Without Borders</a>\n" +
    "            </h4>\n" +
    "            <p>Doctors Without Borders/Médecins Sans Frontières (MSF) is an international medical humanitarian organization created by doctors and journalists in France in 1971.</p>\n" +
    "            <p>In 1999, MSF received the Nobel Peace Prize.</p>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-switch=\"issue.my_solution.$status\">\n" +
    "      <div ng-switch-when=\"disputed\"><progress value=\"issue.my_solution.$percentage\" class=\"progress-striped progress-warning\"></progress></div>\n" +
    "      <div ng-switch-when=\"rejected\"><progress value=\"issue.my_solution.$percentage\" class=\"progress-striped progress-danger\"></progress></div>\n" +
    "      <div ng-switch-when=\"accepted\"><progress value=\"issue.my_solution.$percentage\" class=\"progress-striped progress-success\"></progress></div>\n" +
    "      <div ng-switch-default=\"\"><progress value=\"issue.my_solution.$percentage\" class=\"progress-striped progress-info\"></progress></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"row-fluid\">\n" +
    "      <div class=\"span3 text-center\" ng-class=\"{ 'text-info': (issue.my_solution.$percentage >= 25) }\" popover-placement=\"bottom\" popover-trigger=\"mouseenter\" popover-title=\"You have started working on a solution\" popover=\"When you have finished, submit your code.\">\n" +
    "        1. Started Work\n" +
    "        <i ng-show=\"issue.my_solution.$percentage >= 25\" class=\"icon-ok\"></i>\n" +
    "      </div>\n" +
    "      <div class=\"span3 text-center\" ng-class=\"{ muted: (issue.my_solution.$percentage < 50), 'text-info': (issue.my_solution.$percentage >= 50) }\" popover-placement=\"bottom\" popover-trigger=\"mouseenter\" popover-title=\"Your code has been submitted\" popover=\"Waiting for the project to close the issue and merge your code.\">\n" +
    "        2. Code Submitted\n" +
    "        <i ng-show=\"issue.my_solution.$percentage >= 50\" class=\"icon-ok\"></i>\n" +
    "      </div>\n" +
    "      <div class=\"span3 text-center\" ng-class=\"{ muted: (issue.my_solution.$percentage < 75), 'text-info': (issue.my_solution.$percentage >= 75) }\" popover-placement=\"bottom\" popover-trigger=\"mouseenter\" popover-title=\"Your code has been merged\" popover=\"Your solution is in a two week period during which the backers may submit disputes against your solution.\">\n" +
    "        3. Pending Acceptance\n" +
    "        <i ng-show=\"issue.my_solution.$percentage >= 75\" class=\"icon-ok\"></i>\n" +
    "      </div>\n" +
    "      <div class=\"span3 text-center\" ng-class=\"{ muted: (issue.my_solution.$percentage < 100), 'text-info': (issue.my_solution.$percentage >= 100) }\" popover-placement=\"bottom\" popover-trigger=\"mouseenter\" popover-title=\"Your solution was accepted!\" popover=\"You earned the bounty! Congrats!\">\n" +
    "        4. Accepted\n" +
    "        <i ng-show=\"issue.my_solution.$percentage >= 100\" class=\"icon-ok\"></i>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );

  $templateCache.put("pages/issues/partials/nav_tabs.html",
    "<ul class=\"nav nav-tabs\" ng-controller=\"IssueNavTabsController\">\n" +
    "  <li ng-class=\"active_tab('overview')\"><a ng-href=\"/issues/{{issue.slug}}\">Overview</a></li>\n" +
    "  <li ng-class=\"active_tab('comments')\"><a ng-href=\"/issues/{{issue.slug}}/comments\">\n" +
    "    Comments\n" +
    "    <span class=\"badge badge-info\" ng-show=\"issue.comments.length > 0\">{{issue.comments.length}}</span>\n" +
    "  </a></li>\n" +
    "  <li ng-class=\"active_tab('bounties')\"><a ng-href=\"/issues/{{issue.slug}}/bounties\">\n" +
    "    Bounties\n" +
    "    <span class=\"badge badge-info\" ng-show=\"issue.bounties.length > 0\">{{issue.bounties.length}}</span>\n" +
    "  </a></li>\n" +
    "  <li ng-class=\"active_tab('solutions')\"><a ng-href=\"/issues/{{issue.slug}}/solutions\">\n" +
    "    Solutions\n" +
    "    <span class=\"badge badge-info\" ng-show=\"issue.solutions.length > 0\">{{issue.solutions.length}}</span>\n" +
    "  </a></li>\n" +
    "</ul>"
  );

  $templateCache.put("pages/issues/show.html",
    "<ul class=\"breadcrumb\">\n" +
    "  <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a ng-href=\"/trackers/{{issue.tracker.slug}}\">{{issue.tracker.name || 'Loading...'}}</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a ng-href=\"/issues/{{issue.slug}}\">{{issue.title ||'Loading...'}}</a></li>\n" +
    "</ul>\n" +
    "\n" +
    "<div class=\"row-fluid\" ng-show=\"issue\">\n" +
    "  <div class=\"span9\">\n" +
    "    <div ng-include=\"'pages/issues/partials/header.html'\"></div>\n" +
    "    <div ng-include=\"'pages/issues/partials/nav_tabs.html'\"></div>\n" +
    "\n" +
    "    <div class=\"row-fluid\">\n" +
    "      <div class=\"span1\">\n" +
    "        <img ng-show=\"issue.author_image_url\" ng-src=\"{{issue.author_image_url}}\" class=\"thumbnail\" style=\"width: 100%\">\n" +
    "      </div>\n" +
    "      <div class=\"span11\">\n" +
    "        <p class=\"muted\">{{issue.author_name}} opened this issue on {{issue.created_at | date}}</p>\n" +
    "        <a ng-href=\"{{issue.url}}\" target=\"_blank\">View this issue on the tracker</a>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <br>\n" +
    "    <div ng-bind-html=\"issue.body_html\"></div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"span3\">\n" +
    "    <div ng-include=\"'pages/issues/partials/bounty_box.html'\"></div>\n" +
    "    <div ng-include=\"'pages/issues/partials/developer_box.html'\"></div>\n" +
    "  </div>\n" +
    "</div>"
  );

  $templateCache.put("pages/issues/solutions.html",
    "<ul class=\"breadcrumb\">\n" +
    "  <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a ng-href=\"/trackers/{{issue.tracker.slug}}\">{{issue.tracker.name || 'Loading...'}}</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a ng-href=\"/issues/{{issue.slug}}\">{{issue.title ||'Loading...'}}</a></li>\n" +
    "</ul>\n" +
    "\n" +
    "<div class=\"row-fluid\" ng-show=\"issue\">\n" +
    "  <div class=\"span9\">\n" +
    "    <div ng-include=\"'pages/issues/partials/header.html'\"></div>\n" +
    "    <div ng-include=\"'pages/issues/partials/nav_tabs.html'\"></div>\n" +
    "    <div ng-include=\"'pages/issues/partials/my_solution_box.html'\"></div>\n" +
    "\n" +
    "    <div class=\"alert alert-info\" ng-show=\"issue.solutions.length <= 0\" ng-controller=\"DeveloperBoxController\">Nobody is working on a solution yet. Working on a solution yourself? <a ng-click=\"issue.create_solution()\">Start a solution now!</a></div>\n" +
    "\n" +
    "    <div id=\"solutions-table\" ng-show=\"issue.solutions.length > 0\">\n" +
    "      <table id=\"bounties-table\" class=\"table table-bordered\">\n" +
    "        <thead>\n" +
    "        <tr>\n" +
    "          <th style=\"width: 15%\">Developer</th>\n" +
    "          <th>Submission Notes</th>\n" +
    "          <th style=\"width: 25%; text-align: center\">Status</th>\n" +
    "        </tr>\n" +
    "        </thead>\n" +
    "\n" +
    "        <tbody>\n" +
    "        <tr ng-repeat=\"solution in issue.solutions | orderBy:['-accepted','-in_dispute_period','+disputed','-submitted_at','-submitted','-created_at']\">\n" +
    "          <!--Developer-->\n" +
    "          <td>\n" +
    "            <div class=\"text-center\">\n" +
    "              <a class=\"thumbnail text-center\" ng-href=\"/people/{{solution.person.slug}}\">\n" +
    "                <img ng-src=\"{{ solution.person.image_url }}\">\n" +
    "              </a>\n" +
    "            </div>\n" +
    "          </td>\n" +
    "\n" +
    "          <td>\n" +
    "            <!--Collapsed dispute create form form-->\n" +
    "            <div ng-show=\"solution.submitted\" collapse=\"!solution.$show_dispute\">\n" +
    "              <div ng-show=\"solution.$dispute_error\">\n" +
    "                <div class=\"alert alert-error\">{{solution.$dispute_error}}</div>\n" +
    "              </div>\n" +
    "\n" +
    "              <div>\n" +
    "                <p><strong>File a dispute: </strong>This solution will not be accepted if there are any outstanding disputes. For more info about disputes, refer to the FAQ.</p>\n" +
    "                <ng-form name=\"dispute\" style=\"margin: 0\">\n" +
    "                  <textarea required=\"\" name=\"body\" class=\"span12\" rows=\"3\" placeholder=\"Description of why this solution does not resolve the issue.\" ng-model=\"solution.new_dispute.body\"></textarea>\n" +
    "                  <button ng-click=\"solution.dispute()\" ng-disabled=\"dispute.$invalid\" class=\"btn btn-danger\">File Dispute</button>\n" +
    "                </ng-form>\n" +
    "              </div>\n" +
    "              <br>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"text-info\" ng-show=\"solution.$status == 'started'\">\n" +
    "              <strong>{{solution.person.display_name}} started working on a solution</strong>\n" +
    "              <div><small>started on {{solution.created_at | date:'medium'}}</small></div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"text-success\" ng-show=\"solution.$status == 'pending_merge' || solution.$status == 'in_dispute_period' || solution.$status == 'accepted' || solution.$status == 'paid_out'\">\n" +
    "              <strong>{{solution.person.display_name}}'s solution</strong>\n" +
    "              <div><small>submitted {{solution.submitted_at | date:'medium'}}</small></div>\n" +
    "              <p style=\"white-space: pre-wrap; margin: 0\">{{solution.body}}</p>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"text-warning\" ng-show=\"solution.$status == 'disputed'\">\n" +
    "              <strong>{{solution.person.display_name}}'s solution</strong>\n" +
    "              <div><small>submitted {{solution.submitted_at | date:'medium'}}</small></div>\n" +
    "              <p style=\"white-space: pre-wrap; margin: 0\">{{solution.body}}</p>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"text-error\" ng-show=\"solution.$status == 'rejected'\">\n" +
    "              <strong>{{solution.person.display_name}}'s solution</strong>\n" +
    "              <div ng-show=\"solution.submitted\"><small>submitted {{solution.submitted_at | date:'medium'}}</small></div>\n" +
    "              <p style=\"white-space: pre-wrap; margin: 0\">{{solution.body}}</p>\n" +
    "            </div>\n" +
    "\n" +
    "            <br>\n" +
    "\n" +
    "            <!--Show the disputes-->\n" +
    "            <accordion close-others=\"false\" style=\"margin: 0\">\n" +
    "              <accordion-group ng-repeat=\"dispute in solution.disputes | orderBy:['+closed','-number']\" is-open=\"!dispute.closed\">\n" +
    "                <accordion-heading>\n" +
    "                  <span ng-class=\"{ 'text-info': dispute.closed, 'text-error': !dispute.closed }\">Dispute #{{dispute.number}}</span>\n" +
    "                    <div ng-hide=\"dispute.closed\" class=\"pull-right\"><small>filed by <a ng-href=\"/people/{{dispute.person.slug}}\">{{dispute.person.display_name}}</a> on {{dispute.created_at | date}}</small></div>\n" +
    "                  <div ng-show=\"dispute.closed\" class=\"pull-right\"><small>resolved by <a ng-href=\"/people/{{dispute.person.slug}}\">{{dispute.person.display_name}}</a> on {{dispute.created_at | date}}</small></div>\n" +
    "                </accordion-heading>\n" +
    "\n" +
    "                <div class=\"row-fluid\">\n" +
    "                  <div class=\"span6\">\n" +
    "                    <p style=\"white-space: pre-wrap\">{{dispute.body}}</p>\n" +
    "                  </div>\n" +
    "                  <div class=\"span6\">\n" +
    "\n" +
    "                    <div ng-show=\"!solution.my_dispute.closed && solution.my_dispute.id == dispute.id\">\n" +
    "                      <p class=\"text-success text-center\">Resolve your dispute to allow this solution to be accepted.</p>\n" +
    "                      <button ng-click=\"dispute.resolve()\" class=\"btn btn-block btn-small btn-success\">\n" +
    "                        <i class=\"icon-check icon-white\"></i>\n" +
    "                        Resolve\n" +
    "                      </button>\n" +
    "                      <br>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div ng-hide=\"dispute.closed\">\n" +
    "                      <p class=\"text-center\">Join the discussion to help resolve this dispute.</p>\n" +
    "                      <a ng-href=\"{{issue.url}}\" target=\"_blank\" class=\"btn btn-block btn-small\">\n" +
    "                        <i class=\"icon-comment\"></i>\n" +
    "                        Discussion\n" +
    "                      </a>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div ng-show=\"dispute.closed\">\n" +
    "                      <p class=\"text-info text-center\">This dispute has been resolved.</p>\n" +
    "                    </div>\n" +
    "                  </div>\n" +
    "                </div>\n" +
    "              </accordion-group>\n" +
    "            </accordion>\n" +
    "          </td>\n" +
    "\n" +
    "          <td>\n" +
    "            <!--Solution Progress-->\n" +
    "            <div class=\"text-center\">\n" +
    "              <h5>\n" +
    "                <a ng-click=\"solution.$toggle_show_status_description()\" style=\"text-decoration: none\">\n" +
    "                  <span ng-switch=\"solution.$status\">\n" +
    "                    <span ng-switch-when=\"started\" class=\"text-info\">Started Work</span>\n" +
    "                    <span ng-switch-when=\"pending_merge\" class=\"text-info\">Submitted</span>\n" +
    "                    <span ng-switch-when=\"in_dispute_period\" class=\"text-info\">Pending Acceptance</span>\n" +
    "                    <span ng-switch-when=\"disputed\" class=\"text-warning\">Disputed</span>\n" +
    "                    <span ng-switch-when=\"rejected\" class=\"text-error\">Rejected</span>\n" +
    "                    <span ng-switch-when=\"accepted\" class=\"text-success\">Accepted</span>\n" +
    "                    <span ng-switch-when=\"paid_out\" class=\"text-success\">Accepted</span>\n" +
    "                  </span>\n" +
    "                  <i class=\"icon-question-sign\"></i>\n" +
    "                </a>\n" +
    "              </h5>\n" +
    "\n" +
    "              <!--collapsible status description-->\n" +
    "              <div collapse=\"!solution.$show_status_description\">\n" +
    "                <div ng-switch=\"solution.$status\">\n" +
    "                  <p ng-switch-when=\"started\">The developer has declared that they are working on a solution.</p>\n" +
    "                  <p ng-switch-when=\"pending_merge\">Waiting for the issue to be closed and for the project committer(s) to merge the code.</p>\n" +
    "                  <p ng-switch-when=\"in_dispute_period\">The solution was merged, and is in a dispute period until {{solution.dispute_period_end_date | date}}</p>\n" +
    "                  <p ng-switch-when=\"disputed\">The solution has been disputed by one of the backers.</p>\n" +
    "                  <p ng-switch-when=\"rejected\">The solution was rejected by the project.</p>\n" +
    "                  <p ng-switch-when=\"accepted\">The solution was accepted!</p>\n" +
    "                  <p ng-switch-when=\"paid_out\">The solution was accepted!</p>\n" +
    "                </div>\n" +
    "              </div>\n" +
    "\n" +
    "              <!--Sexy progress bars-->\n" +
    "              <div ng-switch=\"solution.$status\">\n" +
    "                <div ng-switch-when=\"disputed\"><progress value=\"solution.$percentage\" class=\"progress-warning\"></progress></div>\n" +
    "                <div ng-switch-when=\"rejected\"><!--NOTHINGGGG--></div>\n" +
    "                <div ng-switch-when=\"accepted\"><!--NOTHINGGGG--></div>\n" +
    "                <div ng-switch-when=\"paid_out\"><!--NOTHINGGGG--></div>\n" +
    "                <div ng-switch-default=\"\"><progress value=\"solution.$percentage\" class=\"progress-info\"></progress></div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <!--Show solution, Dispute buttonz-->\n" +
    "            <button ng-hide=\"solution.submitted\" class=\"btn btn-small btn-block\" disabled=\"disabled\">\n" +
    "              <i class=\"icon-globe\"></i>\n" +
    "              View Solution\n" +
    "            </button>\n" +
    "            <a ng-show=\"solution.submitted\" class=\"btn btn-small btn-block\" ng-href=\"{{solution.code_url}}\" target=\"_blank\">\n" +
    "              <i class=\"icon-globe\"></i>\n" +
    "              View Solution\n" +
    "            </a>\n" +
    "            <button ng-click-require-auth=\"\" ng-model=\"solution.$show_dispute\" class=\"btn btn-small btn-block btn-danger\" ng-hide=\"!my_bounty || solution.rejected || solution.accepted || (solution.my_dispute && !solution.my_dispute.closed) || solution.person.id == current_person.id || !solution.in_dispute_period\" btn-checkbox=\"\" btn-checkbox-true=\"true\" btn-checkbox-false=\"false\">\n" +
    "              <i class=\"icon-ban-circle icon-white\"></i>\n" +
    "              Dispute\n" +
    "            </button>\n" +
    "          </td>\n" +
    "        </tr>\n" +
    "        </tbody>\n" +
    "      </table>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"span3\">\n" +
    "    <div ng-include=\"'pages/issues/partials/bounty_box.html'\"></div>\n" +
    "    <div ng-include=\"'pages/issues/partials/developer_box.html'\"></div>\n" +
    "  </div>\n" +
    "</div>"
  );

  $templateCache.put("pages/layout/chatroom.html",
    "<div id=\"chatroom\" ng-switch=\"chatroom.url\">\n" +
    "  <div ng-switch-when=\"none\" class=\"connect\">\n" +
    "    <p style=\"text-align: center; padding-top: 10px\">The #Bountysource IRC Chatroom is a place to communicate with other Bountysource users.</p>\n" +
    "    <form style=\"text-align: center; padding-top: 10px\">\n" +
    "      <span>Nickname:</span>\n" +
    "      <input type=\"text\" class=\"input-text input-medium\" name=\"nick\" ng-model=\"chatroom.nick\" style=\"margin: 0px 10px\">\n" +
    "      <button type=\"submit\" class=\"btn btn-success\" ng-click=\"chatroom.connect()\">Connect</button>\n" +
    "    </form>\n" +
    "  </div>\n" +
    "  <iframe ng-switch-default=\"\" ng-src=\"{{chatroom.url}}\"></iframe>\n" +
    "</div>"
  );

  $templateCache.put("pages/layout/footer.html",
    "<footer>\n" +
    "  <div class=\"container\">\n" +
    "    <div class=\"row-fluid\">\n" +
    "      <div class=\"span3\">\n" +
    "        <h4>We :heart: Pull Requests</h4>\n" +
    "        <ul>\n" +
    "          <li><a href=\"https://www.github.com/bountysource/frontend\" target=\"_blank\">Fork us on GitHub</a></li>\n" +
    "          <li><a href=\"https://www.github.com/bountysource/frontend/issues\" target=\"_blank\">Bugs and Feature Requests</a></li>\n" +
    "          <!--<li><a href=\"http://bountysource.github.io/\" target=\"_blank\">API Docs</a></li>-->\n" +
    "        </ul>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"span3\">\n" +
    "        <h4>Company</h4>\n" +
    "        <ul>\n" +
    "          <li><a href=\"/faq\">Frequently Asked Questions</a></li>\n" +
    "          <li><a href=\"/jobs\">Jobs</a></li>\n" +
    "          <!--<li><a href=\"/about/history\">History (2004-2012)</a></li>-->\n" +
    "          <li><a href=\"http://blog.bountysource.com\" target=\"_blank\">Blog</a></li>\n" +
    "        </ul>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"span3\">\n" +
    "        <h4>Contact Us</h4>\n" +
    "        <ul>\n" +
    "          <li><a ng-click=\"chatroom.toggle()\">#bountysource</a> on Freenode IRC</li>\n" +
    "          <li><a href=\"mailto:support@bountysource.com\">support@bountysource.com</a> by Email</li>\n" +
    "          <li><a href=\"https://www.twitter.com/Bountysource\" target=\"_blank\">@bountysource</a> on Twitter</li>\n" +
    "          <li><a href=\"https://www.facebook.com/Bountysource\" target=\"_blank\">Bountysource</a> on Facebook</li>\n" +
    "        </ul>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"span3\">\n" +
    "        <h4>Legal</h4>\n" +
    "        <ul>\n" +
    "          <li><a href=\"/fees\">Pricing</a></li>\n" +
    "          <li><a href=\"/terms\">Terms of Service</a></li>\n" +
    "          <li><a href=\"/privacy\">Privacy Policy</a></li>\n" +
    "          <li>Copyright &copy;2013, Bountysource Inc.</li>\n" +
    "        </ul>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</footer>"
  );

  $templateCache.put("pages/layout/navbar.html",
    "<div class=\"navbar navbar-fixed-top\">\n" +
    "  <div class=\"navbar-inner\">\n" +
    "    <div class=\"container\">\n" +
    "      <button type=\"button\" class=\"btn btn-navbar\" ng-click=\"isCollapsed = !isCollapsed\"><span class=\"icon-bar\"></span><span class=\"icon-bar\"></span><span class=\"icon-bar\"></span></button>\n" +
    "      <a class=\"brand\" href=\"/\"><strong>Bountysource</strong><img src=\"/images/logo-small.png\"></a>\n" +
    "      <div class=\"nav-collapse\" collapse=\"!isCollapsed\">\n" +
    "        <form class=\"navbar-search\" ng-controller=\"NavbarSearchController\" ng-submit=\"submit_search()\">\n" +
    "          <div class=\"icon-search\"></div>\n" +
    "          <input type=\"text\" class=\"search-query\" ng-model=\"search_query\" placeholder=\"Issue URL, Project, Language, etc.\">\n" +
    "        </form>\n" +
    "        <ul class=\"nav pull-right\">\n" +
    "          <li><a href=\"http://blog.bountysource.com\" target=\"_blank\">Blog</a></li>\n" +
    "          <li ng-class=\"{'dropdown': true, 'dropup': true, 'active': chatroom.show}\"><a ng-click=\"chatroom.toggle()\">Chatroom <b class=\"caret\"></b></a></li>\n" +
    "\n" +
    "          <li class=\"dropdown\" ng-controller=\"Signin\">\n" +
    "            <a href=\"/signin\" class=\"dropdown-toggle\" data-toggle=\"dropdown\" ng-hide=\"!!current_person\">Sign In<b class=\"caret\"></b></a>\n" +
    "            <ul class=\"dropdown-menu\" ng-hide=\"!!current_person\" ng-controller=\"NavbarLinkedAccountSignin\">\n" +
    "              <li style=\"padding-left: 10px\">Using:</li>\n" +
    "              <li ng-repeat=\"provider in providers\">\n" +
    "                <a ng-click=\"save_route()\" ng-href=\"{{ signin_url_for(provider.id) }}\"><img ng-src=\"{{provider.image_url}}\"> {{provider.name}}</a>\n" +
    "              </li>\n" +
    "              <li><a href=\"/signin\"><img src=\"images/favicon-email.png\"> Email Address</a></li>\n" +
    "            </ul>\n" +
    "\n" +
    "            <a href=\"/people/{{current_person.slug}}\" class=\"dropdown-toggle\" data-toggle=\"dropdown\" ng-show=\"!!current_person\">\n" +
    "              <img class=\"img-rounded\" ng-src=\"{{current_person.image_url}}\" style=\"width: 18px; height: 18px; margin-right: 5px\">\n" +
    "              {{current_person.display_name}}\n" +
    "              <b class=\"caret\"></b>\n" +
    "            </a>\n" +
    "\n" +
    "            <ul class=\"dropdown-menu\" ng-show=\"!!current_person\">\n" +
    "              <li><a href=\"/activity\">\n" +
    "                <i class=\"icon-bullhorn\"></i>\n" +
    "                Activity\n" +
    "              </a></li>\n" +
    "              <li><a ng-href=\"/people/{{current_person.slug}}\">\n" +
    "                <i class=\"icon-user\"></i>\n" +
    "                Profile\n" +
    "              </a></li>\n" +
    "              <li><a href=\"/tools\">\n" +
    "                <i class=\"icon-wrench\"></i>\n" +
    "                Tools\n" +
    "              </a></li>\n" +
    "              <li><a href=\"/settings\">\n" +
    "                <i class=\"icon-cog\"></i>\n" +
    "                Settings\n" +
    "              </a></li>\n" +
    "              <li class=\"divider\"></li>\n" +
    "              <li><a href=\"/signin\" ng-click=\"signout()\">\n" +
    "                <i class=\"icon-off\"></i>\n" +
    "                Sign Out\n" +
    "              </a></li>\n" +
    "            </ul>\n" +
    "          </li>\n" +
    "\n" +
    "          <li class=\"dropdown\" ng-show=\"can_switch_environments\">\n" +
    "            <a ng-href=\"/people/{{person.slug}}\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n" +
    "              <span class=\"badge badge-important\">{{environment}}</span>\n" +
    "              <b class=\"caret\"></b>\n" +
    "            </a>\n" +
    "\n" +
    "            <ul class=\"dropdown-menu\" ng-controller=\"Navbar\">\n" +
    "              <li><a href=\"\" ng-click=\"setEnv('dev')\">development</a></li>\n" +
    "              <li><a href=\"\" ng-click=\"setEnv('qa')\">staging</a></li>\n" +
    "              <li><a href=\"\" ng-click=\"setEnv('prod')\">production</a></li>\n" +
    "            </ul>\n" +
    "          </li>\n" +
    "\n" +
    "        </ul>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );

  $templateCache.put("pages/layout/not_found.html",
    "<h1>Not Found</h1>\n" +
    "<p>Oops! We can't find the page you're looking for!</p>"
  );

  $templateCache.put("pages/people/activity.html",
    "<ul class=\"breadcrumb\">\n" +
    "  <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "  <!--<li><a href=\"/people\">People</a><span class=\"divider\">»</span></li>-->\n" +
    "  <li><a href=\"/people/{{person.slug}}\">{{ person.display_name ||'Loading...' }}</a></li>\n" +
    "</ul>\n" +
    "\n" +
    "<div class=\"row-fluid\" ng-show=\"person\">\n" +
    "  <div class=\"span4\">\n" +
    "    <ng-include src=\"'pages/people/partials/infobox.html'\"></ng-include>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"span8\">\n" +
    "    <ng-include src=\"'pages/people/partials/tabs.html'\"></ng-include>\n" +
    "\n" +
    "    <ng-include src=\"'pages/people/partials/timeline.html'\"></ng-include>\n" +
    "  </div>\n" +
    "\n" +
    "</div>"
  );

  $templateCache.put("pages/people/following.html",
    "<ul class=\"breadcrumb\">\n" +
    "  <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a href=\"/people\">People</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a ng-href=\"/people/{{person.slug}}\">{{ person.display_name ||'Loading...' }}</a></li>\n" +
    "</ul>\n" +
    "\n" +
    "<div class=\"row-fluid\" ng-show=\"person\">\n" +
    "  <div class=\"span4\">\n" +
    "    <div class=\"well\">\n" +
    "      <ng-include src=\"'pages/people/partials/infobox.html'\"></ng-include>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"span8\">\n" +
    "    <ng-include src=\"'pages/people/partials/tabs.html'\"></ng-include>\n" +
    "\n" +
    "    TODO: show cards for projects this person is following\n" +
    "  </div>\n" +
    "\n" +
    "</div>"
  );

  $templateCache.put("pages/people/partials/infobox.html",
    "<div class=\"well\">\n" +
    "  <div><img ng-src=\"{{person.image_url}}\"></div>\n" +
    "  <h2>{{person.first_name}} {{person.last_name}}</h2>\n" +
    "  <h3>{{person.display_name}}</h3>\n" +
    "  <h4>{{person.company}}</h4>\n" +
    "  <p><strong></strong> {{person.location}}</p>\n" +
    "  <p><strong></strong> {{person.bio}}</p>\n" +
    "  <p><strong>\n" +
    "\n" +
    "  <div ng-show=\"person.github_account || person.twitter_account || person.facebook_account\">\n" +
    "    Profiles:\n" +
    "    <ul>\n" +
    "      <li class=\"provider-link\" ng-show=\"person.github_account\">\n" +
    "        <a ng-href=\"http://github.com/{{person.github_account.login}}\" target=\"_blank\"><img src=\"images/favicon-github.png\"> <span>{{person.github_account.login}}</span></a>\n" +
    "      </li>\n" +
    "      <li class=\"provider-link\" ng-show=\"person.twitter_account\">\n" +
    "        <a ng-href=\"http://twitter.com/{{person.twitter_account.login}}\"><img src=\"images/favicon-twitter.png\"> <span>{{person.twitter_account.login}}</span></a>\n" +
    "      </li>\n" +
    "      <li class=\"provider-link\" ng-show=\"person.facebook_account\">\n" +
    "        <a ng-href=\"http://facebook.com/profile.php?id={{person.facebook_account.uid}}\"><img src=\"images/favicon-facebook.png\"> <span>{{person.facebook_account.login}}</span></a>\n" +
    "      </li>\n" +
    "      <!--<li class=\"provider-link\" ng-show=\"person.gittip_account\">-->\n" +
    "        <!--<a href=\"http://gittip.com/\"><img src=\"images/favicon-facebook.png\"> <span>{{person.gittip_account.login}}</span></a>-->\n" +
    "      <!--</li>-->\n" +
    "    </ul>\n" +
    "  </div>\n" +
    "\n" +
    "  <div ng-show=\"current_person.id == person.id\" class=\"text-center\">\n" +
    "    <a href=\"/settings\" class=\"btn btn-primary\">Edit Your Profile</a>\n" +
    "  </div>\n" +
    "</strong></p></div>"
  );

  $templateCache.put("pages/people/partials/tabs.html",
    "<h1>Activity</h1>\n" +
    "\n" +
    "<ul class=\"nav nav-tabs\" ng-controller=\"PersonTabs\">\n" +
    "  <li ng-repeat=\"tab in tabs\" ng-class=\"{active: is_active(tab.url) }\"><a ng-href=\"{{tab.url}}\">{{tab.name}}</a></li>\n" +
    "</ul>"
  );

  $templateCache.put("pages/people/partials/timeline.html",
    "<table id=\"person-timeline-table\" class=\"table table-striped\">\n" +
    "  <tr ng-repeat=\"action in timeline\">\n" +
    "    <td ng-show=\"action.type == 'pledge'\">\n" +
    "      <strong>{{ person.display_name }}</strong> pledged <strong>{{ action.amount | dollars }}</strong> to <a ng-href=\"/fundraisers/{{ action.target_slug }}\">{{ action.target_name }}</a>\n" +
    "    </td>\n" +
    "\n" +
    "    <td ng-show=\"action.type == 'bounty'\">\n" +
    "      <strong>{{ person.display_name }}</strong> placed a <strong>{{ action.amount | dollars }}</strong> bounty on <a ng-href=\"/issues/{{ action.target_slug }}\">{{ action.target_name }}</a>\n" +
    "    </td>\n" +
    "\n" +
    "    <td ng-show=\"action.type == 'tracker_plugin'\">\n" +
    "      <strong>{{ person.display_name }}</strong> installed the <a ng-href=\"/tools\">GitHub plugin</a> for <a ng-href=\"/trackers/{{ action.target_slug }}\">{{ action.target_name }}</a>\n" +
    "    </td>\n" +
    "\n" +
    "    <td class=\"muted\">{{ action.created_at | date:'medium' }}</td>\n" +
    "  </tr>\n" +
    "\n" +
    "  <tr>\n" +
    "    <td>\n" +
    "      Joined the Bountysource family\n" +
    "    </td>\n" +
    "    <td class=\"muted\">{{ person.created_at | date:'medium' }}</td>\n" +
    "  </tr>\n" +
    "</table>"
  );

  $templateCache.put("pages/pledges/index.html",
    "<div ng-controller=\"FundraiserShowController\">\n" +
    "  <ul class=\"breadcrumb\">\n" +
    "    <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "    <!--<li><a href=\"/fundraisers\">Fundraisers</a><span class=\"divider\">»</span></li>-->\n" +
    "    <li><a ng-href=\"/fundraisers/{{ fundraiser.id }}\">{{ fundraiser.title || 'Loading...' }}</a><span class=\"divider\">»</span></li>\n" +
    "    <li><a>Pledges</a></li>\n" +
    "  </ul>\n" +
    "\n" +
    "  <form class=\"form\" ng-show=\"fundraiser\">\n" +
    "    <div class=\"row-fluid\">\n" +
    "      <div class=\"span9\">\n" +
    "        <div ng-include=\"'pages/fundraisers/partials/header.html'\"></div>\n" +
    "        <div ng-include=\"'pages/fundraisers/partials/nav_tabs.html'\"></div>\n" +
    "\n" +
    "        <div class=\"alert alert-info\" ng-show=\"pledges.length <= 0\">No pledges have been made. <a ng-href=\"/fundraisers/{{fundraiser.slug}}/pledge\">Why don't you make the first pledge?</a></div>\n" +
    "\n" +
    "        <table ng-show=\"pledges && pledges.length > 0\" class=\"table table-striped pledges-table\">\n" +
    "          <thead>\n" +
    "          <tr>\n" +
    "            <th><a ng-click=\"sort_by('person.display_name')\">Backer</a></th>\n" +
    "            <th></th>\n" +
    "            <th><a ng-click=\"sort_by('amount')\">Amount</a></th>\n" +
    "            <th><a ng-click=\"sort_by('created_at')\">Date</a></th>\n" +
    "          </tr>\n" +
    "          </thead>\n" +
    "          <tr ng-repeat=\"pledge in pledges | orderBy:sort_column:sort_reverse\">\n" +
    "            <!--Profile picture. No link if anon-->\n" +
    "            <td style=\"width:70px\">\n" +
    "              <a ng-show=\"pledge.person\" ng-href=\"/people/{{pledge.person.slug}}\"><img class=\"thumbnail\" ng-src=\"{{ pledge.person.image_url }}\"></a>\n" +
    "              <img ng-hide=\"pledge.person\" class=\"thumbnail\" src=\"images/anon.jpg\">\n" +
    "            </td>\n" +
    "\n" +
    "            <td>\n" +
    "              <a ng-show=\"pledge.person\" ng-href=\"/people/{{ pledge.person.slug }}\">{{ pledge.person.display_name }}</a>\n" +
    "              <div ng-hide=\"pledge.person\" class=\"muted\">Anonymous</div>\n" +
    "            </td>\n" +
    "\n" +
    "            <td>\n" +
    "              <div>{{ pledge.amount | currency }}</div>\n" +
    "            </td>\n" +
    "\n" +
    "            <td>\n" +
    "              <div class=\"muted\">{{ pledge.created_at | date }}</div>\n" +
    "            </td>\n" +
    "          </tr>\n" +
    "        </table>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"span3\" ng-controller=\"FundraisersController\">\n" +
    "        <div ng-include=\"'pages/fundraisers/partials/manage.html'\"></div>\n" +
    "        <div ng-include=\"'pages/fundraisers/partials/about_me.html'\"></div>\n" +
    "        <div ng-include=\"'pages/fundraisers/partials/progress_small.html'\"></div>\n" +
    "        <div ng-include=\"'pages/fundraisers/partials/pledge_button.html'\"></div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>"
  );

  $templateCache.put("pages/pledges/new.html",
    "<div ng-controller=\"FundraisersController\">\n" +
    "  <ul class=\"breadcrumb\">\n" +
    "    <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "    <!--<li><a href=\"/fundraisers\">Fundraisers</a><span class=\"divider\">»</span></li>-->\n" +
    "    <li><a ng-href=\"/fundraisers/{{ fundraiser.id }}\">{{ fundraiser.title || 'Loading...' }}</a><span class=\"divider\">»</span></li>\n" +
    "    <li><a>Make Pledge</a></li>\n" +
    "  </ul>\n" +
    "\n" +
    "  <div class=\"row-fluid\" ng-show=\"fundraiser\">\n" +
    "    <div class=\"span9\">\n" +
    "      <div ng-include=\"'pages/fundraisers/partials/header.html'\"></div>\n" +
    "      <div ng-include=\"'pages/fundraisers/partials/nav_tabs.html'\"></div>\n" +
    "\n" +
    "      <form class=\"form-horizontal\" name=\"pledge_form\">\n" +
    "        <div class=\"row-fluid\">\n" +
    "          <div class=\"span6\">\n" +
    "            <div class=\"control-group\" ng-show=\"payment_error\">\n" +
    "              <alert type=\"error\" close=\"payment_error = null\">{{ payment_error }}</alert>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"control-group\">\n" +
    "              <label class=\"control-label\" for=\"amount\">Pledge Amount</label>\n" +
    "\n" +
    "              <div class=\"controls\">\n" +
    "                <div class=\"input-prepend\">\n" +
    "                  <span class=\"add-on\">$</span>\n" +
    "                  <input type=\"number\" min=\"5\" name=\"amount\" id=\"amount\" ng-model=\"pledge.amount\" placeholder=\"Pledge amount\">\n" +
    "                </div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"control-group\">\n" +
    "              <label class=\"control-label\">Payment Method</label>\n" +
    "\n" +
    "              <div class=\"controls\">\n" +
    "                <label class=\"radio\">\n" +
    "                  <input type=\"radio\" ng-model=\"pledge.payment_method\" value=\"google\" selected=\"selected\">\n" +
    "                  <img src=\"images/google-wallet.png\">\n" +
    "                  Google Wallet\n" +
    "                </label>\n" +
    "\n" +
    "                <label class=\"radio\">\n" +
    "                  <input type=\"radio\" ng-model=\"pledge.payment_method\" value=\"paypal\">\n" +
    "                  <img src=\"images/paypal.png\">\n" +
    "                  PayPal\n" +
    "                </label>\n" +
    "\n" +
    "                <!--<label class=\"radio\">-->\n" +
    "                <!--<input type=\"radio\" ng-model=\"pledge.payment_method\" value=\"gittip\" />-->\n" +
    "                <!--<img src=\"images/gittip.png\">-->\n" +
    "                <!--Gittip-->\n" +
    "                <!--</label>-->\n" +
    "\n" +
    "                <label class=\"radio\" ng-show=\"current_person && current_person.account.balance > 0\">\n" +
    "                  <input type=\"radio\" ng-model=\"pledge.payment_method\" value=\"personal\">\n" +
    "                  <img src=\"favicon.ico\">\n" +
    "                  Bountysource {{ current_person.account.balance | dollars }}\n" +
    "                </label>\n" +
    "\n" +
    "                <label class=\"checkbox\">\n" +
    "                  Make anonymous\n" +
    "                  <input type=\"checkbox\" id=\"anonymous\" ng-model=\"pledge.anonymous\">\n" +
    "                </label>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"control-group\">\n" +
    "              <label class=\"control-label\">Choose a Reward</label>\n" +
    "\n" +
    "              <div class=\"controls\">\n" +
    "                <label class=\"radio\">\n" +
    "                  <input type=\"radio\" ng-model=\"pledge.reward_id\" value=\"0\" ng-change=\"set_reward(0)\">\n" +
    "                  <div>No Reward</div>\n" +
    "                </label>\n" +
    "\n" +
    "                <label class=\"radio\" ng-repeat=\"reward in fundraiser.rewards\">\n" +
    "                  <input type=\"radio\" ng-model=\"pledge.reward_id\" value=\"{{reward.id}}\" ng-change=\"set_reward(reward)\">\n" +
    "                  <div>${{ reward.amount | number:0 }} Reward tier</div>\n" +
    "                </label>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"control-group\">\n" +
    "              <div class=\"controls\">\n" +
    "                <button class=\"btn btn-large\" ng-show=\"!pledge.amount || !pledge.payment_method || (selected_reward.fulfillment_details && !pledge.survey_response)\" popover-placement=\"right\" popover-trigger=\"mouseenter\" popover=\"You need to provide the above information to receive this reward.\">Make Pledge</button>\n" +
    "                <button ng-click=\"create_payment()\" class=\"btn btn-large btn-success\" ng-hide=\"!pledge.amount || !pledge.payment_method || (selected_reward.fulfillment_details && !pledge.survey_response)\">Make Pledge</button>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "          </div>\n" +
    "\n" +
    "          <div class=\"span6\">\n" +
    "            <div collapse=\"!selected_reward.fulfillment_details\">\n" +
    "              <div class=\"alert alert-block\" ng-show=\"selected_reward.fulfillment_details\">\n" +
    "                <strong>Reward Survey</strong>\n" +
    "                <span class=\"pull-right label label-important\">required</span>\n" +
    "                <p style=\"white-space: pre-wrap\">{{ selected_reward.fulfillment_details }}</p>\n" +
    "                <br>\n" +
    "                <textarea class=\"span12\" ng-model=\"pledge.survey_response\" rows=\"4\" placeholder=\"Provide the required information from above.\" required=\"\"></textarea>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "\n" +
    "            <div class=\"alert alert-block alert-info\">\n" +
    "              <strong ng-show=\"selected_reward\">Selected Reward: ${{ selected_reward.amount | number:0 }}</strong>\n" +
    "              <strong ng-hide=\"selected_reward\">Selected Reward: None</strong>\n" +
    "\n" +
    "              <p ng-show=\"selected_reward\" style=\"white-space: pre-wrap\">{{ selected_reward.description }}</p>\n" +
    "              <p ng-hide=\"selected_reward\" style=\"white-space: pre-wrap\">I just want to help out</p>\n" +
    "            </div>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </form>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"span3\">\n" +
    "      <div ng-include=\"'pages/fundraisers/partials/manage.html'\"></div>\n" +
    "      <div ng-include=\"'pages/fundraisers/partials/about_me.html'\"></div>\n" +
    "      <div ng-include=\"'pages/fundraisers/partials/progress_small.html'\"></div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );

  $templateCache.put("pages/settings/accounts.html",
    "<ul class=\"breadcrumb\">\n" +
    "  <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a href=\"/settings\">Settings</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a href=\"/settings/accounts\">Accounts</a></li>\n" +
    "</ul>\n" +
    "\n" +
    "<h1>Settings</h1>\n" +
    "\n" +
    "<ng-include src=\"'pages/settings/tabs.html'\"></ng-include>\n" +
    "\n" +
    "<div class=\"alert alert-error\" ng-show=\"error\">{{error}}</div>\n" +
    "<div class=\"alert alert-success\" ng-show=\"success\">{{success}}</div>\n" +
    "\n" +
    "<form class=\"form-horizontal\" name=\"form\" ng-submit=\"change_password()\" novalidate=\"\">\n" +
    "  <p>If you were curious, we use bcrypt so your password will be salted.</p>\n" +
    "  <div class=\"control-group\">\n" +
    "    <label class=\"control-label\" for=\"inputDisplayName\">Current Password:</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <input type=\"password\" id=\"inputDisplayName\" placeholder=\"abcd1234\" ng-model=\"form_data.current_password\" class=\"input-medium\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <label class=\"control-label\" for=\"inputDisplayName\">New Password:</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <input type=\"password\" id=\"inputDisplayName\" placeholder=\"abcd1234\" ng-model=\"form_data.new_password\" class=\"input-medium\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <div class=\"controls\">\n" +
    "      <button type=\"submit\" class=\"btn btn-success\">Change Password</button>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "</form>\n" +
    "\n" +
    "<form class=\"form-horizontal\" novalidate=\"\">\n" +
    "  <p>These accounts can be used for login and more.</p>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <label class=\"control-label\" for=\"inputDisplayName\">Github:</label>\n" +
    "    <div class=\"controls\" ng-show=\"current_person.github_account\">\n" +
    "      <img ng-src=\"{{current_person.github_account.avatar_url}}\" style=\"width: 50px; height: 50px\">\n" +
    "      {{ current_person.github_account.login }}\n" +
    "    </div>\n" +
    "    <div class=\"controls\" ng-hide=\"current_person.github_account\">\n" +
    "      <a ng-href=\"{{github_link}}\" ng-click=\"set_post_auth_url()\">Link with GitHub</a>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <label class=\"control-label\" for=\"inputDisplayName\">Twitter:</label>\n" +
    "    <div class=\"controls\" ng-show=\"current_person.twitter_account\">\n" +
    "      <img ng-src=\"{{current_person.twitter_account.avatar_url}}\" style=\"width: 50px; height: 50px\">\n" +
    "      {{ current_person.twitter_account.login }}\n" +
    "    </div>\n" +
    "    <div class=\"controls\" ng-hide=\"current_person.twitter_account\">\n" +
    "      <a ng-href=\"{{twitter_link}}\" ng-click=\"set_post_auth_url()\">Link with Twitter</a>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <label class=\"control-label\" for=\"inputDisplayName\">Facebook:</label>\n" +
    "    <div class=\"controls\" ng-show=\"current_person.facebook_account\">\n" +
    "      <img ng-src=\"{{current_person.facebook_account.avatar_url}}\" style=\"width: 50px; height: 50px\">\n" +
    "      {{ current_person.facebook_account.login }}\n" +
    "    </div>\n" +
    "    <div class=\"controls\" ng-hide=\"current_person.facebook_account\">\n" +
    "      <a ng-href=\"{{facebook_link}}\" ng-click=\"set_post_auth_url()\">Link with Facebook</a>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "</form>"
  );

  $templateCache.put("pages/settings/email.html",
    "<ul class=\"breadcrumb\">\n" +
    "  <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a href=\"/settings\">Settings</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a href=\"/settings/email\">Email</a></li>\n" +
    "</ul>\n" +
    "\n" +
    "<h1>Settings</h1>\n" +
    "\n" +
    "<ng-include src=\"'pages/settings/tabs.html'\"></ng-include>\n" +
    "\n" +
    "<div class=\"alert alert-error\" ng-show=\"error\">{{error}}</div>\n" +
    "<div class=\"alert alert-success\" ng-show=\"success\">{{success}}</div>\n" +
    "\n" +
    "<form class=\"form-horizontal\" name=\"form\" ng-submit=\"submit()\" novalidate=\"\">\n" +
    "  <div class=\"control-group\">\n" +
    "    <label class=\"control-label\" for=\"inputEmail\">Primary Email:</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <input type=\"email\" id=\"inputEmail\" name=\"email\" placeholder=\"john@doe.com\" ng-model=\"form_data.email\" class=\"input-medium\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <label class=\"control-label\" for=\"inputEmail\">Email Options:</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <label class=\"checkbox\">\n" +
    "        <input type=\"checkbox\" id=\"inputTerms\" ng-model=\"form_data.weekly_newsletter\"> Weekly Newsletter\n" +
    "      </label>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <div class=\"controls\">\n" +
    "      <button type=\"submit\" class=\"btn btn-success\">Save</button>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "</form>"
  );

  $templateCache.put("pages/settings/profile.html",
    "<ul class=\"breadcrumb\">\n" +
    "  <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a href=\"/settings\">Settings</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a href=\"/settings\">Profile</a></li>\n" +
    "</ul>\n" +
    "\n" +
    "<h1>Settings</h1>\n" +
    "<ng-include src=\"'pages/settings/tabs.html'\"></ng-include>\n" +
    "\n" +
    "<form class=\"form-horizontal\" name=\"form\" novalidate=\"\">\n" +
    "  <div class=\"alert alert-error\" ng-show=\"error\">{{error}}</div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <label class=\"control-label\" for=\"inputFirstName\">First and Last Name:</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <input type=\"text\" id=\"inputFirstName\" placeholder=\"John\" ng-model=\"form_data.first_name\" class=\"input-small\">\n" +
    "      <input type=\"text\" placeholder=\"Doe\" ng-model=\"form_data.last_name\" class=\"input-small\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <label class=\"control-label\" for=\"inputDisplayName\">Display Name:</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <input type=\"text\" id=\"inputDisplayName\" placeholder=\"johnny5\" ng-model=\"form_data.display_name\" class=\"input-medium\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <label class=\"control-label\" for=\"inputLocation\">Location:</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <input type=\"text\" id=\"inputLocation\" name=\"location\" placeholder=\"San Francisco, CA\" ng-model=\"form_data.location\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <label class=\"control-label\" for=\"inputCompany\">Company:</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <input type=\"text\" id=\"inputCompany\" name=\"company\" placeholder=\"Dunder Mifflin\" ng-model=\"form_data.company\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <label class=\"control-label\" for=\"inputUrl\">Website:</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <input type=\"text\" id=\"inputUrl\" name=\"url\" placeholder=\"http://awesome.site/\" ng-model=\"form_data.url\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <label class=\"control-label\" for=\"inputPublicEmail\">Public Email Address:</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <input type=\"text\" id=\"inputPublicEmail\" name=\"email\" placeholder=\"john@doe.com\" ng-model=\"form_data.public_email\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <label class=\"control-label\" for=\"inputBio\">Bio:</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <textarea rows=\"3\" id=\"inputBio\" name=\"bio\" placeholder=\"Once upon a time...\" ng-model=\"form_data.bio\"></textarea>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <!--<div class=\"control-group\" ng-show=\"form_data.image_url.match(/gravatar\\.com/)\">-->\n" +
    "    <!--<label class=\"control-label\" for=\"inputPublicEmail\">Gravatar Email Address:</label>-->\n" +
    "    <!--<div class=\"controls\">-->\n" +
    "      <!--<input type=\"text\" id=\"inputPublicEmail\" name=\"email\" placeholder=\"john@doe.com\" ng-model=\"form_data.gravatar_email\" />-->\n" +
    "      <!--<img src=\"{{form_data.image_url}}\" style=\"width: 50px; height: 50px\" ng-show=\"form_data.image_url\" />-->\n" +
    "    <!--</div>-->\n" +
    "  <!--</div>-->\n" +
    "\n" +
    "  <!--<div class=\"control-group\">-->\n" +
    "    <!--<label class=\"control-label\" for=\"inputPicture\">Picture:</label>-->\n" +
    "    <!--<div class=\"controls\">-->\n" +
    "      <!--<label class=\"radio\" ng-repeat=\"image_url in profile_pics\" style=\"display: inline-block; padding-right: 30px\">-->\n" +
    "        <!--<input type=\"radio\" name=\"optionsRadios\" id=\"optionsRadios1\" value=\"option1\" style=\"margin-top: 18px\">-->\n" +
    "        <!--<img src=\"{{image_url}}\" style=\"width: 50px; height: 50px\" />-->\n" +
    "      <!--</label>-->\n" +
    "    <!--</div>-->\n" +
    "  <!--</div>-->\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <div class=\"controls\">\n" +
    "      <button type=\"submit\" class=\"btn btn-success\" ng-click=\"save()\">Save</button>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</form>"
  );

  $templateCache.put("pages/settings/tabs.html",
    "<ul class=\"nav nav-tabs\" ng-controller=\"SettingsTabs\">\n" +
    "  <li ng-repeat=\"tab in tabs\" ng-class=\"{active: is_active(tab.url) }\"><a ng-href=\"{{tab.url}}\">{{tab.name}}</a></li>\n" +
    "</ul>"
  );

  $templateCache.put("pages/signin/reset.html",
    "<form class=\"form-horizontal form-signin\" name=\"form\" novalidate=\"\">\n" +
    "  <h2>Reset your password</h2>\n" +
    "  <p>Enter your email address to have a confirmation</p>\n" +
    "\n" +
    "  <div class=\"alert alert-error\" ng-show=\"error\">{{error}}</div>\n" +
    "\n" +
    "  <div class=\"control-group\" ng-class=\"{ error: (show_validations && form.email.$invalid) || (form.email.$error.email) }\">\n" +
    "    <label class=\"control-label\" for=\"inputEmail\">Email Address:</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <input type=\"email\" id=\"inputEmail\" name=\"email\" placeholder=\"john@doe.com\" ng-model=\"form_data.email\" required=\"\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\" ng-class=\"{ error: (show_validations && form.code.$invalid) }\">\n" +
    "    <label class=\"control-label\" for=\"inputCode\">Reset Code:</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <input type=\"text\" name=\"code\" id=\"inputCode\" placeholder=\"abcd1234\" ng-model=\"form_data.code\" class=\"input-medium\" required=\"\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\" ng-class=\"{ error: (show_validations && form.new_password.$invalid) || (form.new_password.$error.pattern || form.new_password.$error.minlength) }\">\n" +
    "    <label class=\"control-label\" for=\"inputPassword\">New Password:</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <input type=\"password\" name=\"new_password\" id=\"inputPassword\" placeholder=\"abcd1234\" ng-model=\"form_data.new_password\" class=\"input-medium\" ng-minlength=\"8\" ng-pattern=\"/[a-zA-Z].*[0-9]|[0-9].*[a-zA-Z]/\" required=\"\" tooltip=\"Letter, number and 8+ characters.\" tooltip-placement=\"right\" tooltip-trigger=\"focus\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <div class=\"controls\">\n" +
    "      <button type=\"submit\" class=\"btn btn-success\" ng-click=\"reset_password()\">Reset Password</button>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "</form>"
  );

  $templateCache.put("pages/signin/signin.html",
    "<form class=\"form-horizontal form-signin\" name=\"form\" novalidate=\"\">\n" +
    "  <h2>Please sign in to continue</h2>\n" +
    "\n" +
    "  <div ng-hide=\"provider\">\n" +
    "    <p>The easiest way is to use an account you already have.</p>\n" +
    "\n" +
    "    <div class=\"control-group\">\n" +
    "      <label class=\"control-label\" for=\"inputEmail\">Use a Service:</label>\n" +
    "      <div class=\"controls\">\n" +
    "        <ul ng-controller=\"Signin\">\n" +
    "          <li ng-repeat=\"provider in providers\" class=\"provider-link\">\n" +
    "            <a ng-href=\"{{ signin_url_for(provider.id) }}\"><img ng-src=\"{{provider.image_url}}\"> <span>{{provider.name}}</span></a>\n" +
    "          </li>\n" +
    "        </ul>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <p>Otherwise, enter an email address and password to continue.</p>\n" +
    "  </div>\n" +
    "\n" +
    "  <div ng-show=\"provider\" ng-switch=\"\" on=\"signin_or_signup\">\n" +
    "    <p ng-switch-when=\"signin\">Enter your password to link with your existing Bountysource account.</p>\n" +
    "    <p ng-switch-when=\"signup\">Complete the fields below to sign up for Bountysource.</p>\n" +
    "    <p ng-switch-default=\"\">Please enter your email address to continue.</p>\n" +
    "  </div>\n" +
    "\n" +
    "  <input type=\"hidden\" ng-model=\"form_data.account_link_id\">\n" +
    "\n" +
    "  <div class=\"alert alert-error\" ng-show=\"error\">{{error}}</div>\n" +
    "\n" +
    "  <div class=\"control-group\" ng-class=\"{ error: (show_validations && form.email.$invalid) || (form.email.$error.email), success: (signin_or_signup == 'signin' || signin_or_signup == 'signup'), warning: signin_or_signup == 'pending' }\">\n" +
    "    <label class=\"control-label\" for=\"inputEmail\">Email Address:</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <input type=\"email\" id=\"inputEmail\" name=\"email\" placeholder=\"john@doe.com\" ng-model=\"form_data.email\" ng-change=\"email_changing()\" ng-blur=\"email_changed()\" required=\"\">\n" +
    "      <span class=\"help-inline\" ng-show=\"signin_or_signup=='signin'\"><small>Found!</small></span>\n" +
    "      <span class=\"help-inline\" ng-show=\"signin_or_signup=='signup'\"><small>Available!</small></span>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\" ng-hide=\"provider && (signin_or_signup!='signin')\" ng-class=\"{ error: (show_validations && form.password.$invalid) || (form.password.$error.pattern || form.password.$error.minlength) }\">\n" +
    "    <label class=\"control-label\" for=\"inputPassword\">Password:</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <input type=\"password\" name=\"password\" id=\"inputPassword\" placeholder=\"abcd1234\" ng-model=\"form_data.password\" class=\"input-medium\" ng-minlength=\"8\" ng-pattern=\"/[a-zA-Z].*[0-9]|[0-9].*[a-zA-Z]/\" required=\"\" tooltip=\"Letter, number and 8+ characters.\" tooltip-placement=\"right\" tooltip-trigger=\"focus\">\n" +
    "      <span class=\"help-inline\" ng-show=\"signin_or_signup=='signin'\"><small><a ng-click=\"forgot_password()\">Forgot?</a></small></span>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\" ng-show=\"signin_or_signup=='signup'\">\n" +
    "    <label class=\"control-label\" for=\"inputFirstName\">First and Last Name:</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <input type=\"text\" id=\"inputFirstName\" placeholder=\"John\" ng-model=\"form_data.first_name\" class=\"input-small\">\n" +
    "      <input type=\"text\" id=\"inputLastName\" placeholder=\"Doe\" ng-model=\"form_data.last_name\" class=\"input-small\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\" ng-show=\"signin_or_signup=='signup'\">\n" +
    "    <label class=\"control-label\" for=\"inputDisplayName\">Display Name:</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <input type=\"text\" id=\"inputDisplayName\" placeholder=\"johnny5\" ng-model=\"form_data.display_name\" class=\"input-medium\">\n" +
    "      <img ng-src=\"{{form_data.avatar_url}}\" style=\"width: 30px; height: 30px\" ng-show=\"form_data.avatar_url\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\" ng-show=\"signin_or_signup=='signup'\">\n" +
    "    <label class=\"control-label\" for=\"inputTerms\">Legal:</label>\n" +
    "    <div class=\"controls\">\n" +
    "      <label class=\"checkbox\">\n" +
    "        <input type=\"checkbox\" id=\"inputTerms\" ng-model=\"form_data.terms\"> I agree to the <a href=\"/terms\" target=\"_blank\">Terms of Services</a>.\n" +
    "      </label>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"control-group\">\n" +
    "    <div class=\"controls\">\n" +
    "      <button type=\"submit\" class=\"btn btn-success\" ng-click=\"signin()\" ng-show=\"signin_or_signup!='signup'\">Sign In</button>\n" +
    "      <button type=\"submit\" class=\"btn btn-success\" ng-click=\"signup()\" ng-show=\"signin_or_signup=='signup'\">Sign Up</button>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "</form>"
  );

  $templateCache.put("pages/tools/tools.html",
    "<ul class=\"breadcrumb\">\n" +
    "  <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a href=\"/tools\">Tools</a></li>\n" +
    "</ul>\n" +
    "\n" +
    "<h1>Tools</h1>\n" +
    "<hr>\n" +
    "\n" +
    "<div class=\"row-fluid\">\n" +
    "  <div class=\"span4\">\n" +
    "    <table class=\"table table-striped\">\n" +
    "      <thead ng-show=\"relations\">\n" +
    "      <tr>\n" +
    "        <th>\n" +
    "          Projects <span class=\"badge badge-info\">{{(relations | filter:relations_filter).length | number}}</span>\n" +
    "          <small ng-show=\"(relations | filter:relations_filter).length != relations.length\" class=\"muted\">of {{relations.length | number}}</small>\n" +
    "        </th>\n" +
    "      </tr>\n" +
    "      </thead>\n" +
    "\n" +
    "      <tbody>\n" +
    "      <!--Filter options-->\n" +
    "      <tr>\n" +
    "        <div class=\"well\">\n" +
    "          <input type=\"text\" class=\"span12\" placeholder=\"Search projects...\" ng-model=\"filter_options.text\">\n" +
    "          <br>\n" +
    "          <label class=\"checkbox\">\n" +
    "            <input type=\"checkbox\" ng-model=\"filter_options.only_with_plugin\">\n" +
    "            Hide projects without GitHub plugin\n" +
    "          </label>\n" +
    "        </div>\n" +
    "      </tr>\n" +
    "\n" +
    "      <!--Not found message-->\n" +
    "      <tr ng-show=\"(relations | filter:relations_filter).length <= 0\" class=\"info\">\n" +
    "        <td class=\"text-info\"><i>No projects found :(</i></td>\n" +
    "      </tr>\n" +
    "\n" +
    "      <!--Loading projects-->\n" +
    "      <tr ng-hide=\"relations\">\n" +
    "        <td class=\"text-center\">\n" +
    "          <p class=\"lead\">Loading Projects....</p>\n" +
    "          <progress value=\"100\" class=\"progress-striped active\"></progress>\n" +
    "        </td>\n" +
    "      </tr>\n" +
    "\n" +
    "      <!--Projects!-->\n" +
    "      <tr ng-show=\"relations\" ng-repeat=\"relation in relations | orderBy:relations_order:true | filter:relations_filter\" ng-class=\"{ info: (selected_relation.id == relation.id) }\">\n" +
    "        <td>\n" +
    "          <button ng-click=\"relation.select()\" class=\"btn btn-link\">{{relation.project.name}}</button>\n" +
    "          <div ng-show=\"relation.project.tracker_plugin\" class=\"pull-right badge badge-info\">Plugin Installed</div>\n" +
    "        </td>\n" +
    "      </tr>\n" +
    "      </tbody>\n" +
    "    </table>\n" +
    "  </div>\n" +
    "  <div class=\"span8\">\n" +
    "    <!--Show error or success messages-->\n" +
    "    <div ng-show=\"tracker_plugin_alert\">\n" +
    "      <alert type=\"tracker_plugin_alert.type\" close=\"tracker_plugin_alert=null\">{{tracker_plugin_alert.message}}</alert>\n" +
    "    </div>\n" +
    "\n" +
    "    <!--Info explaining the plugin. Only shown until you click a project-->\n" +
    "    <div collapse=\"hide_info || selected_relation\">\n" +
    "      <div class=\"hero-unit\">\n" +
    "        <p class=\"lead\">You can enable or disable services that allow Bountysource to automatically do a few things whenever a bounty is posted or updated</p>\n" +
    "        <ul>\n" +
    "          <li>add or update bounty total in issue titles</li>\n" +
    "          <li>add a Bountysource label to GitHub issues with bounties</li>\n" +
    "          <li>add a link to the bounty at the bottom of the issue body</li>\n" +
    "        </ul>\n" +
    "\n" +
    "        <p class=\"lead\">Here is an example of what your issues will look like on GitHub:</p>\n" +
    "        <p>Bounty total in issue title:</p>\n" +
    "        <img class=\"thumbnail\" src=\"images/github-plugin-example.png\">\n" +
    "        <br>\n" +
    "        <p>Bounty link in issue body:</p>\n" +
    "        <img class=\"thumbnail\" src=\"images/github-plugin-example2.png\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div collapse=\"!selected_relation\">\n" +
    "      <div collapse=\"selected_relation.project.tracker_relation\">\n" +
    "        <div class=\"well well-large\">\n" +
    "          <!--Installing spinner action-->\n" +
    "          <div collapse=\"!selected_relation.$installing_plugin\" class=\"text-center\">\n" +
    "            <p class=\"lead\">Installing GitHub Plugin...</p>\n" +
    "            <progress value=\"100\" class=\"progress-striped active\"></progress>\n" +
    "          </div>\n" +
    "\n" +
    "          <div collapse=\"selected_relation.$installing_plugin\">\n" +
    "            <!--Manage plugin form-->\n" +
    "            <div ng-show=\"selected_relation.project.tracker_plugin\">\n" +
    "\n" +
    "              <div>{{relation.project.tracker_plugin}}</div>\n" +
    "\n" +
    "              <h3>Manage {{selected_relation.project.name}}</h3>\n" +
    "              <form class=\"form-horizontal\">\n" +
    "                <label class=\"checkbox\">\n" +
    "                  <input type=\"checkbox\" ng-model=\"selected_relation.project.tracker_plugin.add_bounty_to_title\">\n" +
    "                  Add bounty total to issue title\n" +
    "                </label>\n" +
    "\n" +
    "                <label class=\"checkbox\">\n" +
    "                  <input type=\"checkbox\" ng-model=\"selected_relation.project.tracker_plugin.add_label\">\n" +
    "                  Add label to issues with bounties\n" +
    "                </label>\n" +
    "\n" +
    "                <div style=\"margin-left: 20px\">\n" +
    "                  <form class=\"form-horizontal\">\n" +
    "                    <div class=\"control-group\">\n" +
    "                      <label class=\"control-label\">Label Name</label>\n" +
    "                      <div class=\"controls\">\n" +
    "                        <input class=\"inline\" type=\"text\" placeholder=\"bounty\" ng-model=\"selected_relation.project.tracker_plugin.label_name\" ng-disabled=\"!selected_relation.project.tracker_plugin.add_label\">\n" +
    "                      </div>\n" +
    "                    </div>\n" +
    "                  </form>\n" +
    "                </div>\n" +
    "\n" +
    "                <label class=\"checkbox\">\n" +
    "                  <input type=\"checkbox\" ng-model=\"selected_relation.project.tracker_plugin.add_link_to_description\">\n" +
    "                  Include link to active bounties on issues\n" +
    "                </label>\n" +
    "\n" +
    "                <label class=\"checkbox\" style=\"margin-left: 20px\">\n" +
    "                  <input type=\"checkbox\" ng-model=\"selected_relation.project.tracker_plugin.add_link_to_all_issues\" ng-disabled=\"!selected_relation.project.tracker_plugin.add_link_to_description\">\n" +
    "                  Include \"create bounty\" link on open issues without bounties\n" +
    "                </label>\n" +
    "\n" +
    "                <br>\n" +
    "\n" +
    "                <button class=\"btn btn-primary\" ng-click=\"selected_relation.project.tracker_plugin.update()\" ng-disabled=\"selected_relation.project.tracker_plugin.is_changed()\">Save</button>\n" +
    "                <button class=\"btn\" ng-click=\"selected_relation.project.tracker_plugin.reset()\" ng-disabled=\"selected_relation.project.tracker_plugin.is_changed()\">Reset</button>\n" +
    "                <button class=\"btn\" ng-click=\"selected_relation.project.tracker_plugin.close()\">Close</button>\n" +
    "              </form>\n" +
    "            </div>\n" +
    "\n" +
    "            <!--Install plugin prompt-->\n" +
    "            <div ng-hide=\"selected_relation.project.tracker_plugin\">\n" +
    "              <h2>{{selected_relation.project.name}}</h2>\n" +
    "              <p class=\"lead\">Automatically display bounty information on GitHub issues. Install the GitHub plugin to get started!</p>\n" +
    "              <button require-github-auth=\"public_repo\" class=\"btn btn-large btn-primary\" ng-click=\"selected_relation.install_plugin()\" ng-hide=\"selected_relation.$hide_install_button\">\n" +
    "                <i class=\"icon-flag icon-white\"></i>\n" +
    "                Install GitHub Plugin\n" +
    "              </button>\n" +
    "              <p ng-show=\"selected_relation.$hide_install_button\" class=\"text-error\">{{selected_relation.$install_failed_error}}</p>\n" +
    "            </div>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );

  $templateCache.put("pages/trackers/partials/homepage_card.html",
    "<div class=\"row-fluid\">\n" +
    "  <div class=\"span2\">\n" +
    "    <a ng-href=\"/trackers/{{project.slug}}\" style=\"display: block; width: 75px; height: 75px; background-repeat: no-repeat; background-size: 95% auto; background-position: center center; background-image: url({{project.image_url}})\">\n" +
    "    </a>\n" +
    "  </div>\n" +
    "  <div class=\"span10\">\n" +
    "    <strong><a ng-href=\"/trackers/{{project.slug}}\">{{project.name}}</a></strong>\n" +
    "    <br>\n" +
    "    <small class=\"muted\">{{project.description | truncate:70}}</small>\n" +
    "    <br>\n" +
    "    <small class=\"text-success\"><strong>{{project.bounty_total | dollars}}</strong> in bounties</small>\n" +
    "  </div>\n" +
    "</div>"
  );

  $templateCache.put("pages/trackers/partials/nav_tabs.html",
    "<ul class=\"nav nav-tabs\">\n" +
    "  <li class=\"active\"><a ng-href=\"/trackers/{{tracker.slug}}\" data-toggle=\"tab\">Issues</a></li>\n" +
    "</ul>"
  );

  $templateCache.put("pages/trackers/show.html",
    "<ul class=\"breadcrumb\">\n" +
    "  <li><a href=\"/\">Home</a><span class=\"divider\">»</span></li>\n" +
    "  <li><a ng-href=\"/trackers/{{tracker.slug}}\">{{ tracker.name ||'Loading...' }}</a></li>\n" +
    "</ul>\n" +
    "\n" +
    "<div class=\"row-fluid\" ng-show=\"tracker\">\n" +
    "  <div class=\"span3\">\n" +
    "    <div class=\"well text-center\">\n" +
    "      <div><img ng-src=\"{{tracker.image_url}}\"></div>\n" +
    "      <br>\n" +
    "      <button class=\"btn btn-block\" ng-click=\"tracker.follow()\">\n" +
    "        <span ng-show=\"tracker.followed\">\n" +
    "          <i class=\"icon-star\"></i>\n" +
    "          Following this project\n" +
    "        </span>\n" +
    "        <span ng-hide=\"tracker.followed\">\n" +
    "          <i class=\"icon-star-empty\"></i>\n" +
    "          Follow this project\n" +
    "        </span>\n" +
    "      </button>\n" +
    "\n" +
    "      <a ng-href=\"{{tracker.url}}\" target=\"_blank\" class=\"btn btn-block\">\n" +
    "        <i class=\"icon-globe\"></i>\n" +
    "        View Issue Tracker\n" +
    "      </a>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"well well-small\">\n" +
    "      <div class=\"text-center\">\n" +
    "        <a ng-click=\"show_bounties()\"><h2 style=\"margin: 0\" ng-show=\"tracker.bounty_total > 0\" class=\"text-center\">{{tracker.bounty_total | dollars}}</h2></a>\n" +
    "        <div>in bounties</div>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"row-fluid\">\n" +
    "        <div class=\"span6 text-center\">\n" +
    "          <h3 style=\"margin: 0\">{{tracker.forks | number}}</h3>\n" +
    "          <div>{{'fork' | pluralize:tracker.forks}}</div>\n" +
    "        </div>\n" +
    "        <div class=\"span6 text-center\">\n" +
    "          <h3 style=\"margin: 0\">{{tracker.watchers | number}}</h3>\n" +
    "          <div>{{'watcher' | pluralize:tracker.watchers}}</div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!--<h4>Tags</h4>-->\n" +
    "\n" +
    "    <!--<form class=\"form-inline\">-->\n" +
    "      <!--<input type=\"text\" class=\"span7\" ng-model=\"tracker.new_tag.name\" placeholder=\"Add a new tag\" />-->\n" +
    "      <!--<button type=\"submit\" class=\"btn btn-primary\" ng-click=\"tracker.create_tag()\">-->\n" +
    "        <!--<i class=\"icon-tag icon-white\"></i>-->\n" +
    "        <!--Add Tag-->\n" +
    "      <!--</button>-->\n" +
    "    <!--</form>-->\n" +
    "\n" +
    "    <!--<div ng-repeat=\"tag_relation in tracker.tags | orderBy:'weight':true\">-->\n" +
    "      <!--<ul class=\"inline\">-->\n" +
    "        <!--<li style=\"width: 24px;\"><a ng-show=\"tag_relation.vote <= 0\" ng-click=\"tag_relation.upvote()\"><i class=\"icon-thumbs-up\"></i></a></li>-->\n" +
    "        <!--<li style=\"width: 24px;\"><a ng-show=\"tag_relation.vote >= 0\" ng-click=\"tag_relation.downvote()\"><i class=\"icon-thumbs-down\"></i></a></li>-->\n" +
    "        <!--<li><strong>{{tag_relation.weight}}</strong></li>-->\n" +
    "        <!--<li>-->\n" +
    "          <!--<span class=\"label label-info\">-->\n" +
    "            <!--<i class=\"icon-tag icon-white\"></i>-->\n" +
    "            <!--{{tag_relation.tag.name}}-->\n" +
    "          <!--</span>-->\n" +
    "        <!--</li>-->\n" +
    "      <!--</ul>-->\n" +
    "    <!--</div>-->\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"span9\">\n" +
    "    <h1>{{tracker.name}}</h1>\n" +
    "    <p class=\"lead\">{{tracker.description}}</p>\n" +
    "\n" +
    "    <!--<div ng-include=\"'pages/trackers/partials/nav_tabs.html'\"></div>-->\n" +
    "    <!--<hr />-->\n" +
    "\n" +
    "    <!--Issue filter box-->\n" +
    "    <div class=\"well well-small\">\n" +
    "      <div class=\"row-fluid\">\n" +
    "        <div class=\"span6\">\n" +
    "          <input type=\"text\" class=\"span12\" min=\"0\" placeholder=\"Search issues\" ng-model=\"issue_filter_options.text\" ng-change=\"update_filter_options()\">\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"span6\">\n" +
    "          <div style=\"display:inline-block;vertical-align:middle\">Bounty Range: $</div>\n" +
    "          <input type=\"number\" class=\"span4\" min=\"1\" placeholder=\"50\" ng-model=\"issue_filter_options.bounty_min\" ng-change=\"update_filter_options()\" style=\"margin-bottom:0;display:inline-block;vertical-align:middle\" tooltip=\"Minimum bounty amount\" tooltip-placement=\"bottom\" tooltip-trigger=\"focus\">\n" +
    "          <div style=\"display:inline-block;vertical-align:middle\"> - </div>\n" +
    "          <input type=\"number\" class=\"span4\" min=\"1\" placeholder=\"Infinity\" ng-model=\"issue_filter_options.bounty_max\" ng-change=\"update_filter_options()\" style=\"margin-bottom:0;display:inline-block;vertical-align:middle\" tooltip=\"Maximum bounty amount\" tooltip-placement=\"bottom\" tooltip-trigger=\"focus\">\n" +
    "        </div>\n" +
    "      </div>\n" +
    "\n" +
    "      <ul class=\"inline\" style=\"margin-bottom: 0\">\n" +
    "        <li>\n" +
    "          <label class=\"checkbox\">\n" +
    "            <input type=\"checkbox\" ng-model=\"issue_filter_options.only_valuable\">\n" +
    "            Has active bounties\n" +
    "          </label>\n" +
    "        </li>\n" +
    "        <li>\n" +
    "          <label class=\"checkbox\">\n" +
    "            <input type=\"checkbox\" ng-model=\"issue_filter_options.hide_open\">\n" +
    "            Hide open issues\n" +
    "          </label>\n" +
    "        </li>\n" +
    "        <li>\n" +
    "          <label class=\"checkbox\">\n" +
    "            <input type=\"checkbox\" ng-model=\"issue_filter_options.hide_closed\">\n" +
    "            Hide closed issues\n" +
    "          </label>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "\n" +
    "    <!--No issues shown message -->\n" +
    "    <div ng-show=\"(issues | filter:issue_filter).length == 0\" class=\"alert alert-info\">No issues found :(</div>\n" +
    "\n" +
    "    <!--Table of issues-->\n" +
    "    <table class=\"table table-condensed table-striped\" ng-show=\"(issues | filter:issue_filter).length > 0\">\n" +
    "      <thead>\n" +
    "      <tr>\n" +
    "        <th class=\"span1\"><a ng-click=\"change_order_col('bounty_total')\">Bounty</a></th>\n" +
    "        <th class=\"span10\">Issue Title</th>\n" +
    "        <th class=\"span1\"><a ng-click=\"change_order_col('comment_count')\">Comments</a></th>\n" +
    "      </tr>\n" +
    "      </thead>\n" +
    "\n" +
    "      <tbody>\n" +
    "      <tr ng-repeat=\"issue in issues | filter:issue_filter | orderBy:order_col:order_reverse\" ng-class=\"{ success: (issue.bounty_total > 0), warning: (!issue.can_add_bounty) }\">\n" +
    "        <td>\n" +
    "          <span ng-show=\"issue.bounty_total > 0\" class=\"badge badge-success\">{{issue.bounty_total | dollars}}</span>\n" +
    "        </td>\n" +
    "        <td class=\"span7\">\n" +
    "          <a ng-href=\"/issues/{{issue.slug}}\" ng-class=\"{ 'text-success': (issue.bounty_total > 0), 'text-warning': (!issue.can_add_bounty) }\">\n" +
    "            <i ng-show=\"issue.bounty_total >= 1000\" class=\"icon-fire\"></i>\n" +
    "            <span ng-show=\"!issue.can_add_bounty\" class=\"label label-warning\">closed</span>\n" +
    "            {{issue.title}}\n" +
    "          </a>\n" +
    "        </td>\n" +
    "        <td class=\"text-center\">\n" +
    "          <a ng-href=\"/issues/{{issue.slug}}/comments\" class=\"label label-info\">\n" +
    "            <i class=\"icon-comment icon-white\"></i>\n" +
    "            {{issue.comment_count | number}}\n" +
    "          </a>\n" +
    "        </td>\n" +
    "      </tr>\n" +
    "      </tbody>\n" +
    "    </table>\n" +
    "  </div>\n" +
    "</div>"
  );

}]);
