// // angular.module('services').service('$teams', function ($rootScope, $api, $q) {
//   var deferred = $q.defer();
//   $rootScope.teams = deferred.promise;

//   this.load = function () {
//     $rootScope.$watch('current_person',function (person) {
//       if (angular.isObject(person)) {
//         $api.person_teams(person.id).then(function(teams) {
//           $rootScope.teams = deferred.resolve(angular.copy(teams));
//         }).catch(function () {
//           $rootScope.teams = deferred.resolve([]);
//         });
//       }
//     });
//   };

//   this.get = function () {
//     return $rootScope.teams;
//   };
// })
