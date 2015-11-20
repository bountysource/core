angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/report/accounts', {
        templateUrl: 'admin/reports/accounts.html',
        controller: "AccountsReportController"
      });
  })
  .controller("AccountsReportController", function ($scope, $routeParams, $api, $filter, $window) {
    $scope.startDate = $filter('html5date')(new Date());
    $scope.endDate = $filter('html5date')(new Date());

    $scope.totals = {
      gross: 0.0,
      bountysource_fee: 0.0,
      processing_fee: 0.0,
      liability: 0.0
    };

    $scope.generate_report = function() {
      $scope.loading_start_accounts = true;

      $api.call("/admin/report/accounts", "GET", { date: $scope.startDate }).then(function(accounts) {
        $scope.loading_start_accounts = false;
        $scope.start_accounts = accounts;
      });

      $scope.loading_end_accounts = true;

      $api.call("/admin/report/accounts", "GET", { date: $scope.endDate }).then(function(accounts) {
        $scope.loading_end_accounts = false;
        $scope.end_accounts = accounts;
      });

      var transactions_payload = {
        start_date: $scope.startDate,
        end_date: $scope.endDate
      };

      $scope.loading_transactions = true;

      $api.call("/admin/report/transactions", "GET", transactions_payload).then(function(response) {
        $scope.loading_transactions = false;

        $scope.totals = {
          gross: response.gross,
          bountysource_fee: response.bountysource_fee,
          processing_fee: response.processing_fee,
          liability: response.liability
        };

        for (var i=0; i<response.transactions.length; i++) {
          response.transactions[i].$selected = false;
        }

        $scope.transactions = response.transactions;
      });
    };

    $scope.escrow_accounts = [
      'Account::Paypal',
      'Account::GoogleWallet',
      'Account::BofA'
    ];

    $scope.transaction_filters = {
      description: "",
      show_incomplete: true,
      show_complete: true
    };

    $scope.transactionFilter = function(transaction) {
      var show = true;

      // filter by description
      if ($scope.transaction_filters.description && $scope.transaction_filters.description.length > 0) {
        var regex = new RegExp($scope.transaction_filters.description);
        show = regex.test(transaction.description);
      }

      // filter out if gross <= 0
      if (!$scope.transaction_filters.show_incomplete) {
        if (show) { show = ((transaction.gross || '0') > 0); }
      }

      // filter out if gross > 0
      if (!$scope.transaction_filters.show_complete) {
        if (show) { show = ((transaction.gross || '0') <= 0); }
      }

      return show;
    };

    $scope.update_transaction = function(transaction) {
      console.log('update_transaction', transaction);
    };

    $scope.delete_transaction = function(transaction) {
      $api.delete_transaction(transaction.id).then(function(response) {
        // remove from local cache
        for (var i=0; i<$scope.transactions.length; i++) {
          if ($scope.transactions[i].id === transaction.id) {
            $scope.transactions.splice(i,1);
            break;
          }
        }
      });
    };

    $scope.toggle_select_all_transactions_value = false;
    $scope.toggle_select_all_transactions = function() {
      for (var i=0; i<$scope.transactions.length; i++) {
        if ($scope.transactionFilter($scope.transactions[i])) {
          $scope.transactions[i].$selected = $scope.toggle_select_all_transactions_value;
        }
      }
    };

    $scope.delete_selected_transactions = function() {
      if ($window.confirm("Are you REALLY sure about that? I mean, you're deleting Transactions. Please thing about what you are doing first. Really. Step back and take a breath, come back to your computer and execute your so thoughtfully crafted plan of action.")) {
        for (var i=0; i<$scope.transactions.length; i++) {
          if ($scope.transactions[i].$selected) {
            $scope.delete_transaction($scope.transactions[i]);
          }
        }
      }
    };
  });
