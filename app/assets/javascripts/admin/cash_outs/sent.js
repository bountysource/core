angular
  .module("app")
  .config(function ($routeProvider) {
    $routeProvider.when("/admin/cash_outs/sent", {
      templateUrl: "admin/cash_outs/sent.html",
      controller: "SentCashOutsController",
    });
  })
  .controller("SentCashOutsController", function ($scope, $api) {
    // number of items to show in a page
    var itemsPerPage = 100;
    $scope.itemsPerPage = itemsPerPage;
    $scope.maxSize = 10; // number of pagination links to show
 
    $scope.updatePage = function (page) {
      $scope.contentLoaded = false;
      var params = {
        page: page,
        per_page: itemsPerPage,
        sent: true,
        order: "+sent",
        include_address: true,
        include_mailing_address: true,
        include_person: true,
      };
      $scope.downloadCSV = function () {
        var params = { csv: true };
        $api
          .call("/admin/cash_outs", params, {
            sent: true,
            order: "-created",
            include_address: true,
            include_mailing_address: true,
            include_person: true,
            csv: false,
          })
          .then((response) => {
            let csv =
              "ID,Submited at,Sent at,Account ID,Amount,Fee,Person ID,Physical Address,Paypal\n";
            for (let i = 0; i < response.length; i++) {
              const element = response[i];
              const address = element.serialized_address.address1.replace(
                /,/g,
                " "
              );
              const city = element.serialized_address.city.replace(/,/g, " ");
              csv += `${element.id},${element.created_at},${element.sent_at},${element.account_id},${element.amount},${element.fee},${element.person_id},${element.serialized_address.name} ${address} ${city} ${element.serialized_address.postal_code} ${element.serialized_address.country},${element.paypal_address}\n`;
            }
            let dwldLink = document.createElement("a");
            let container = document.getElementById("main-content");
            let blob = new Blob(["\ufeff" + csv], {
              type: "text/csv;charset=utf-8;",
            });
            let url = URL.createObjectURL(blob);
            dwldLink.setAttribute("href", url);
            dwldLink.setAttribute("download", "cashouts" + ".csv");
            dwldLink.style.visibility = "hidden";
            container.appendChild(dwldLink);
            dwldLink.click();
            container.removeChild(dwldLink);
          });
      };
      $api.call("/admin/cash_outs", params, function (
        response,
        status,
        headers
      ) {
        if (response.meta.success) {
          $scope.cashOuts = angular.copy(response.data);
          $scope.contentLoaded = true;
 
          // set pagination data
          $scope.currentPage = page;
          $scope.pageCount = headers("Total-Pages");
        }
      });
    };
 
    $scope.updatePage(1);
  });