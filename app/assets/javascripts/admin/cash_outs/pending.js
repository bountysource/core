angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/cash_outs/pending', {
        templateUrl: 'admin/cash_outs/pending.html',
        controller: "PendingCashOutsController"
      });
  })
  .controller("PendingCashOutsController", function ($scope, $api) {

    $scope.updatePage = function(page) {
      var params = { 
        page: page || 1, 
        per_page: 10,

        sent: false,
        order: '-created',
        include_address: true,
        include_mailing_address: true,
        include_person: true
      };
  
      $scope.working = true;
  
      $api.call('/admin/cash_outs', params, function(response) {
        if (response.meta.success) {
          $scope.working = false;
          $scope.cashOuts = angular.copy(response.data);

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

    $scope.updatePage(1)
  });