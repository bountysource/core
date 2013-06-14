angular.module('api.bountysource',[]).
  service('$api', function($http, $q, $cookieStore, $rootScope, $location) {
    this.api_host = "https://api.bountysource.com/";
//    this.api_host = "http://api.bountysource.dev/";
//    this.api_host = "https://www-qa.bountysource.com/";

    // call(url, 'POST', { foo: bar }, optional_callback)
    this.call = function() {
      // parse arguments
      var args = Array.prototype.slice.call(arguments);
      var url = this.api_host + args.shift().replace(/^\//,'');
      var method = typeof(args[0]) == 'string' ? args.shift() : 'GET';
      var params = typeof(args[0]) == 'object' ? args.shift() : {};
      var callback = typeof(args[0]) == 'function' ? args.shift() : function(response) { return response.data; };

      // merge in params
      params.callback = 'JSON_CALLBACK';
      params._method = method;
      if ($cookieStore.get('access_token')) params.access_token = $cookieStore.get('access_token');

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
      return this.call("/user/fundraisers/"+id);
    };

    this.fundraiser_update = function(id, data) {
      return this.call("/user/fundraisers/"+id, "PUT", data);
    };

    this.fundraiser_pledges_get = function(id) {
      return this.call("/user/fundraisers/"+id+"/pledges");
    };

    this.fundraiser_update_get = function(fundraiser_id, id) {
      return this.call("/user/fundraisers/"+fundraiser_id+"/updates/"+id);
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

    this.signin = function(email, password) {
      return this.call("/user/login", "POST", { email: email, password: password }, function(response) {
        console.log(response);
        if (response.meta.status == 200) {
          $rootScope.current_person = response.data;
          $cookieStore.put('access_token', $rootScope.current_person.access_token);
          $location.path("/");
        }
      });
    };

    this.verify_access_token = function() {
      console.log("verifying")
      var access_token = $cookieStore.get('access_token');
      if (access_token) {
        var that = this;
        this.call("/user", { access_token: access_token }, function(response) {
          if (response.meta.status == 200) {
            console.log("access token still valid");
            $rootScope.current_person = response.data;
          } else {
            console.log("access token expired. signing out.");
            that.signout();
          }
        });
      }
    };

    this.signout = function() {
      $rootScope.current_person = null;
      $cookieStore.remove('access_token');
      $location.path("/");
    };

  });
