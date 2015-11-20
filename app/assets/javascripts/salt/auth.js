angular.module('app').config(function($stateProvider) {
  // hacky but convienent place to store this function... person gets resolved in "auth" state
  $stateProvider.personRequired = function($q, $state, $auth, person) {
    if (!person.id) {
      $auth.saveTargetStateToCookie();
      $state.transitionTo("root.session.signup");
      return $stateProvider.rejectedPromise();
    }
  };

  $stateProvider.rejectedPromise = function($q) {
    var deferred = $q.defer();
    deferred.reject();
    return deferred.promise;
  };

  // root state that provides layout and resolves person
  $stateProvider.state('auth', {
    abstract: true,
    template: "<ui-view/>",
    resolve: {
      person: function($api, $auth) {
        return $auth.resolveResource($api.people.me);
      }
    }
  });

  // used in $auth.logout()
  $stateProvider.state('auth.noop', {});

}).run(function($rootScope, $auth) {
  // store the state we're trying to go to so we can access it in personRequired
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
    $auth.targetState = [toState.name, toParams];
  });
  $rootScope.$on('$stateChangeSuccess', function() {
    delete $auth.targetState;
  });
  $rootScope.$on('$stateChangeError', function() {
    delete $auth.targetState;
  });
}).factory('$auth', function($location, $cookieJar, $rootScope, $q, $state, $timeout) {
  var $auth = {
    // shared cookie with www.bountysource.com
    access_token_cookie_name: window.BS_ENV.cookie_name_access_token,

    getAccessToken: function() {
      return $cookieJar.getJson($auth.access_token_cookie_name);
    },

    setAccessToken: function(new_access_token) {
      // $auth.signout() as well as login.js rely on this
      delete $rootScope.person;

      var matches = $location.host().match(/[a-z0-9][a-z0-9\-]+\.[a-z\.]{2,6}$/i);
      var domain_opts = matches ? { domain: '.' + matches[0] } : null;

      // remove www.bountysource.com and .bountysource.com cookie
      $cookieJar.remove($auth.access_token_cookie_name);
      if (domain_opts) {
        $cookieJar.remove($auth.access_token_cookie_name, domain_opts);
      }

      if (!new_access_token) {
        // no new cookie, do nothing
        return;
      } else if (domain_opts) {
        // set cookie for .bountysource.com
        $cookieJar.setJson($auth.access_token_cookie_name, new_access_token, domain_opts);
      } else {
        // not on a domain, don't specify domain
        $cookieJar.setJson($auth.access_token_cookie_name, new_access_token);
      }

      return new_access_token;
    },

    person: function() {
      return $rootScope.person;
    },

    resolveResource: function(resource) {
      if (typeof($rootScope.person) !== 'undefined') {
        // already processed, do nothing
      } else if ($auth.getAccessToken()) {
        // run the resource that was passed in... can't have $api.person.me here directly because of circular dependency
        $rootScope.person = resource();
      } else {
        // no cookie, set it to empty hash
        var deferred = $q.defer();
        $rootScope.person = { $promise: deferred.promise, $resolved: true };
        deferred.resolve($rootScope.person);
      }

      return $rootScope.person.$promise;
    },

    logout: function() {
      // wipe out cookie, and delete $rootScope.person
      $auth.setAccessToken();

      // reload the current state
      // NOTE: $state.reload(); IS NOT SUFFICIENT
      // this bug was hard to track down. if you click "sign out" on a
      // page that requires auth (via personRequired), the auth.resolve.person
      // promise wasn't getting reloaded and they were staying logged in.
      // this is because personReqiured relies on returning a rejected promise.
      // but ui-router behavior is that when a promise is rejected, none of the
      // resolve changes are "saved". we get around it by going to a "noop"
      // which will be successful and reload the auth.resolve.person and *then*
      // go to the actual target. timeout is necessary because transitionTo's
      // wipe each other out.
      var toState = $state.current.name;
      var toParams = angular.copy($state.params);
      $state.transitionTo('auth.noop', {}, { reload: true });
      $timeout(function() {
        $state.transitionTo(toState, toParams, { reload: true, location: 'replace' });
      }, 0);
    },

    saveTargetStateToCookie: function() {
      $cookieJar.setJson('post_auth_url', $auth.targetState);
    },

    gotoTargetState: function() {
      var state = $cookieJar.getJson('post_auth_url') || [];
      var name = state[0] || 'root.home';
      var params = state[1] || {};
      $cookieJar.remove('post_auth_url');
      $state.transitionTo(name, params, { reload: true });
    }
  };
  return $auth;
});
