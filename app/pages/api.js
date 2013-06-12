angular.module('api.bountysource',[]).
  factory('$api', function($http, $q){
    return {
      fundraiser_cards: function() {
        var deferred = $q.defer();
        $http.jsonp("https://api.bountysource.com/fundraisers/cards?callback=JSON_CALLBACK").success(function(response) {
          deferred.resolve(response.data.in_progress.concat(response.data.completed));
        });
        return deferred.promise;
      },

      fundraiser_get: function(id) {
        var deferred = $q.defer();
        $http.jsonp("https://api.bountysource.com/user/fundraisers/"+id+"?callback=JSON_CALLBACK").success(function(response) {
          deferred.resolve(response.data);
        });
        return deferred.promise;
      },

      people_recent: function(id) {
        var deferred = $q.defer();
        $http.jsonp("https://api.bountysource.com/user/recent?callback=JSON_CALLBACK").success(function(response) {
          console.log(response);
          deferred.resolve(response.data);
        });
        return deferred.promise;
      },

      project_cards: function(id) {
        var deferred = $q.defer();
        $http.jsonp("https://api.bountysource.com/trackers/cards?callback=JSON_CALLBACK").success(function(response) {
          console.log(response);
          deferred.resolve(response.data.featured_trackers.concat(response.data.all_trackers));
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
