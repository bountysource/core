'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/report/paypal', {
        templateUrl: 'admin/reports/paypal.html',
        controller: "PaypalReportController"
      });
  })
  .controller("PaypalReportController", ['$scope', '$routeParams', '$filter', '$api', '$window', function ($scope, $routeParams, $filter, $api, $window) {
    $scope.account = 'Account::Paypal';
    $scope.startDate = $filter('html5date')(new Date('04-01-2013'));
    $scope.endDate = $filter('html5date')(new Date('04-30-2013'));

    $scope.totals = {
      gross: 0.0,
      bountysource_fee: 0.0,
      processing_fee: 0.0,
      liability: 0.0
    };

    $scope.report_rows = [
      { name: 'Start Balance', value: $filter('currency')(0) },
      { name: 'End Balance', value: $filter('currency')(0) },
      { name: 'Processing Fees', value: $filter('currency')(0) },
      { name: 'Bountysource Fees', value: $filter('currency')(0) },
      { name: 'Gross', value: $filter('currency')(0) },
      { name: 'Liability', value: $filter('currency')(0) }
    ];

    $scope.update_report_row = function(name, value) {
      for (var i=0; i<$scope.report_rows.length; i++) {
        if ($scope.report_rows[i].name === name) {
          $scope.report_rows[i].value = value;
          break;
        }
      }
    };

    $scope.generate_report = function() {
      $scope.loading_start_account_balance = true;
      $api.call("/admin/report/account_balance", "GET", { date: $scope.startDate, account: $scope.account }).then(function(response) {
        console.log('start_account_balance', response);

        $scope.loading_start_account_balance = false;

        $scope.update_report_row('Start Balance', $filter('currency')(response.balance));
        $scope.start_account_balance = response.balance;
      });

      $scope.loading_end_account_balance = true;
      $api.call("/admin/report/account_balance", "GET", { date: $scope.endDate, account: $scope.account }).then(function(response) {
        console.log('end_account_balance', response);

        $scope.loading_end_account_balance = false;

        $scope.update_report_row('End Balance', $filter('currency')(response.balance));
        $scope.end_account_balance = response.balance;
      });

      var transactions_payload = {
        start_date: $scope.startDate,
        end_date: $scope.endDate,
        account: $scope.account
      };

      $scope.loading_transactions = true;
      $api.call("/admin/report/transactions", "GET", transactions_payload).then(function(response) {
        $scope.loading_transactions = false;

        $scope.totals = {
          gross: 0,
          bountysource_fee: 0,
          processing_fee: 0,
          liability: 0
        };

        for (var i=0; i<response.transactions.length; i++) {
          $scope.totals.gross += parseFloat(response.transactions[i].gross || 0);
          $scope.totals.bountysource_fee += parseFloat(response.transactions[i].fee || 0);
          $scope.totals.processing_fee += parseFloat(response.transactions[i].processing_fee || 0);
          $scope.totals.liability += parseFloat(response.transactions[i].liability || 0);

          response.transactions[i].$selected = false;
        }

        $scope.update_report_row('Gross', $filter('currency')($scope.totals.gross));
        $scope.update_report_row('Bountysource Fees', $filter('currency')($scope.totals.bountysource_fee));
        $scope.update_report_row('Processing Fees', $filter('currency')($scope.totals.processing_fee));
        $scope.update_report_row('Liability', $filter('currency')($scope.totals.liability));

        $scope.transactions = response.transactions;
      });
    };

    $scope.transaction_filters = {
      description: "",
      show_incomplete: true,
      show_complete: true,
      show_splits: false
    };

    $scope.transactionFilter = function(transaction) {
      var show = true;

      // filter by description
      if ($scope.transaction_filters.description && $scope.transaction_filters.description.length > 0) {
        var regex = new RegExp($scope.transaction_filters.description);
        show = regex.test(transaction.description);
      }

      if (!$scope.transaction_filters.show_incomplete) {
        transaction.gross = transaction.gross || 0;
        transaction.fee = transaction.fee || 0;
        transaction.processing_fee = transaction.processing_fee || 0;
        transaction.liability = transaction.liability || 0;

        if (show) {
          show = !(transaction.gross <= 0 || transaction.fee <= 0 || transaction.processing_fee <= 0 || transaction.liability <= 0);
        }
      }

      if (!$scope.transaction_filters.show_complete) {
        transaction.gross = transaction.gross || 0;
        transaction.fee = transaction.fee || 0;
        transaction.processing_fee = transaction.processing_fee || 0;
        transaction.liability = transaction.liability || 0;

        if (show) {
          show = !(transaction.gross > 0 || transaction.fee > 0 || transaction.processing_fee > 0 || transaction.liability > 0);
        }
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
      $scope.toggle_select_all_transactions_value = !$scope.toggle_select_all_transactions_value;

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

    // Update totals on the transactions tab with the selected visible transactions
    $scope.update_totals = function() {
      var transactions = $filter('filter')($scope.transactions, $scope.transactionFilter);
      transactions = $filter('filter')(transactions, { $selected: true });

      $scope.totals = {
        gross: 0,
        bountysource_fee: 0,
        processing_fee: 0,
        liability: 0
      };

      for (var i=0; i<transactions.length; i++) {
        $scope.totals.gross += parseFloat(transactions[i].gross || 0);
        $scope.totals.bountysource_fee += parseFloat(transactions[i].fee || 0);
        $scope.totals.processing_fee += parseFloat(transactions[i].processing_fee || 0);
        $scope.totals.liability += parseFloat(transactions[i].liability || 0);
      }

      console.log($scope.totals, transactions);
    };
  }]);
