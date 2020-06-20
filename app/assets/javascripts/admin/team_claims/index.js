angular.module('app').config(function ($routeProvider) {
  $routeProvider.when('/admin/team_claims', {
    templateUrl: 'admin/team_claims/index.html',
    controller: function ($scope, $api, $window) {
      
      $scope.updatePage = function(page) {
        var params = { page: page || 1, per_page: 10};
    
        $scope.working = true;
    
        $api.call('/admin/team_claims', params).then(function(response) {
          if (response.meta.success) {
            $scope.working = false;
            $scope.team_claims = response.data;
            var pagination = response.meta.pagination;
            $scope.totalItems = pagination.items;
            $scope.itemsPerPage = pagination.per_page;
            $scope.currentPage = pagination.page  || 1;
            $scope.pageCount = Math.ceil(pagination.items/pagination.per_page);
            $scope.maxSize = 10;
          } else {
            $scope.working = false;
            $scope.error = response.data.error;
            //do something with the error  
          }
        });
      };

      $scope.acceptClaim = function(claim) {
        if (confirm("You sure?")) {
          $api.call('/admin/team_claims/'+claim.id, 'PUT', { accepted: true });
          $window.location.reload();
        }
      };

      $scope.rejectClaim = function(claim) {
        var reason = prompt("Rejection reason?");
        if (reason && reason.length > 0) {
          $api.call('/admin/team_claims/'+claim.id, 'PUT', { rejected: true, rejected_notes: reason });
          $window.location.reload();
        }
      };

      $scope.updatePage(1);
    }
  });
});
