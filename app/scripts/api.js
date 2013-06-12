angular.module('api.bountysource',[]).
  factory('$api', function($http, $q){
    return {
      fundraiser: {
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
