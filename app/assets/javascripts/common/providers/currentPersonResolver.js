angular.module('bountysource').provider('CurrentPersonResolver', function () {
  this.$get = function ($q, $rootScope) {
    return function () {
      var currentPersonDeferred = $q.defer();

      $rootScope.$watch('current_person', function (person) {
        if (person) {
          currentPersonDeferred.resolve(angular.copy(person));
        } else if (person === false) {
          currentPersonDeferred.reject(false);
        }
      });

      return currentPersonDeferred.promise;
    };
  };
});