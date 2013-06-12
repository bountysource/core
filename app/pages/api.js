angular.module('api.bountysource',[]).
  factory('$api', function($http, $q){
    return {
      fundraiser: {
        cards: function() {
          var deferred = $q.defer();
          $http.jsonp("https://api.bountysource.com/fundraisers/cards?callback=JSON_CALLBACK").success(function(response) {
            console.log(response);
            deferred.resolve(response.data.in_progress.concat(response.data.completed));
          });
          return deferred.promise;
        },

        find: function(id) {
          var deferred = $q.defer();

          $http.jsonp("https://api.bountysource.com/user/fundraisers/"+id+"?callback=JSON_CALLBACK").success(function(response) {
            console.log(response);
            deferred.resolve(response.data);
          });

          return deferred.promise;
        }
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
