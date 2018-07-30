angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.teams.supporters', {
    url: "/teams/{slug}/supporters",
    templateUrl: "salt/teams/supporters.html",
    container: false,
    controller: function($rootScope, $stateParams, $scope, $state, $api) {
      $scope.downloadSupporters = function(){
        var params = { team_slug: $stateParams.slug, page: $scope.currentPage, per_page: 100, order: 'monthly' };
        $api.supporters
          .query(params, function(response){
            $scope.supporters = angular.copy(response);
          });
      };

      $scope.currentPage = 1;

      $scope.downloadSupporters();

      $scope.next = function(){
        $scope.currentPage = $scope.currentPage + 1;
        $scope.downloadSupporters();
      };

      $scope.back = function(){
        $scope.currentPage = $scope.currentPage - 1;
        $scope.downloadSupporters();
      };
    }
  });
});
