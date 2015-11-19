// inspired by http://www.objectpartners.com/2014/06/03/extending-angulars-resource-service-for-a-consistent-api/

angular.module('app').factory('$api', function($resource, $http, $location, $auth, $env) {
  var $api = {

    url: function(path) {
      if (path[0] === '/') {
        path = $env.api_host + path.replace(/^\/+/,'');
      }
      return path;
    },

    add: function(resource, config) {
      if (!config) {
        config = {};
      }

      // default resource to :id param
      var params = config.params || { id: '@id' };

      // default to: https://api.bountysource.com/resource/:id
      var url = $api.url(config.url || '/' + resource + '/:id');

      // default methods
      var methods = {
        get: { method: 'GET' },
        create: { method: 'POST' },
        update: { method: 'PUT' },
        query:  { method: 'GET', isArray: true },
        remove: { method: 'DELETE' },
        delete: { method: 'DELETE' }
      };

      // allow additional methods
      for (var key in (config.methods||[])) {
        methods[key] = config.methods[key];
      }

      // add v2 headers and access token
      angular.forEach(methods, function(value, key) {
        if (value.url) {
          value.url = $api.url(value.url);
        }
        value.transformRequest = $http.defaults.transformRequest.concat(function(data, headersGetter) {
          var headers = headersGetter();
          headers.Accept = 'application/vnd.bountysource+json; version='+(value.api_version || config.api_version || 2);
          var access_token = $auth.getAccessToken();
          if (access_token) {
            headers.Authorization = 'token ' + access_token;
          }
          return data;
        });
      });

      // register the resource
      $api[resource] = $resource(url, params, methods);

      // allow chaining
      return $api;
    },

    hash_to_params: function(obj) {
      var str = [];
      for(var p in obj) {
        if (obj.hasOwnProperty(p)) {
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
      }
      return str.join("&");
    },

    oauth_url: function(provider, options) {
      return $api.url('/auth/' + provider + '?' + $api.hash_to_params(options))
    }
  };
  return $api;
});
