angular.module('api.bountysource',[]).
  factory('$api', function($http, $q){
    // var api_host = "https://api.bountysource.com";
    var api_host = "http://api.bountysource.dev";

    return {
      fundraiser_cards: function() {
        var deferred = $q.defer();
        $http.jsonp(api_host+"/fundraisers/cards?callback=JSON_CALLBACK").success(function(response) {
          deferred.resolve(response.data.in_progress.concat(response.data.completed));
        });
        return deferred.promise;
      },

      fundraiser_get: function(id) {
        var deferred = $q.defer();
        $http.jsonp(api_host+"/user/fundraisers/"+id+"?callback=JSON_CALLBACK").success(function(response) {
          deferred.resolve(response.data);
        });
        return deferred.promise;
      },

      fundraiser_pledges_get: function(id) {
        var deferred = $q.defer();
        $http.jsonp(api_host+"/user/fundraisers/"+id+"/pledges?callback=JSON_CALLBACK").success(function(response) {
          deferred.resolve(response.data);
        });
        return deferred.promise;
      },

      fundraiser_update_get: function(fundraiser_id, id) {
        var deferred = $q.defer();
        $http.jsonp(api_host+"/user/fundraisers/"+fundraiser_id+"/updates/"+id+"?callback=JSON_CALLBACK").success(function(response) {
          deferred.resolve(response.data);
        });
        return deferred.promise;
      },

      people_recent: function(id) {
        var deferred = $q.defer();
        $http.jsonp(api_host+"/user/recent?callback=JSON_CALLBACK").success(function(response) {
          deferred.resolve(response.data);
        });
        return deferred.promise;
      },

      person_get: function(id) {
        var deferred = $q.defer();
        $http.jsonp(api_host+"/users/"+id+"?callback=JSON_CALLBACK").success(function(response) {
          deferred.resolve(response.data);
        });
        return deferred.promise;
      },

      person_timeline_get: function(id) {
        var deferred = $q.defer();
        $http.jsonp(api_host+"/users/"+id+"/activity?callback=JSON_CALLBACK").success(function(response) {
          deferred.resolve(response.data);
        });
        return deferred.promise;
      },

      project_cards: function() {
        var deferred = $q.defer();
        $http.jsonp(api_host+"/trackers/cards?callback=JSON_CALLBACK").success(function(response) {
          console.log(response);
          deferred.resolve(response.data.featured_trackers.concat(response.data.all_trackers));
        });
        return deferred.promise;
      },

      tracker_get: function(id) {
        var deferred = $q.defer();
        $http.jsonp(api_host+"/trackers/"+id+"/overview?callback=JSON_CALLBACK").success(function(response) {
          console.log(response);
          deferred.resolve(response.data);
        });
        return deferred.promise;
      },

      issue_get: function(id) {
        var deferred = $q.defer();
        $http.jsonp(api_host+"/issues/"+id+"?callback=JSON_CALLBACK").success(function(response) {
          console.log(response);
          deferred.resolve(response.data);
        });
        return deferred.promise;
      }

    };
  });



//    return {
//      fundraiser: $resource('https://api.bountysource.com/user/fundraisers/:id',
//        { callback: 'JSON_CALLBACK' },
//        { get: { method: 'JSONP' } }
//      ),
//      issue:
//
//      };
//    };
