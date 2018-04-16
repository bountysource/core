angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/cash_outs/sent', {
        templateUrl: 'admin/cash_outs/sent.html',
        controller: "SentCashOutsController"
      });
  })
  .controller("SentCashOutsController", function ($scope, $api) {

    // number of items to show in a page
    var itemsPerPage = 100;
    $scope.itemsPerPage = itemsPerPage;
    $scope.maxSize = 10; // number of pagination links to show

    $scope.updatePage = function(page) {
      $scope.contentLoaded = false;
      var params = {
        page: page,
        per_page: itemsPerPage,
        sent: true,
        order: '+sent',
        include_address: true,
        include_mailing_address: true,
        include_person: true
      };

      $api.call('/admin/cash_outs', params, function(response, status, headers) {
        if (response.meta.success) {
          $scope.cashOuts = angular.copy(response.data);
          $scope.contentLoaded = true;

          // set pagination data
          $scope.currentPage = page;
          $scope.pageCount = headers('Total-Pages');
        }
      });
    };

    $scope.updatePage(1);
  });
