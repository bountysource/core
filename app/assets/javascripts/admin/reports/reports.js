angular.module('app').config(function ($routeProvider) {
    $routeProvider
      .when('/admin/reports', {
        templateUrl: 'admin/reports/reports.html',
        controller: "ReportsController",
        reloadOnSearch: false
      });
  })

  .factory('Month', ['$filter', function($filter) {
    return function(name, start_date, end_date) {
      this.name = name;
      this.start_date = $filter('html5date')(start_date);
      this.end_date = $filter('html5date')(end_date);
    };
  }])

  .factory('EscrowReport', [function() {
    return function() {
      this.start_balance = 0.0;
      this.end_balance = 0.0;
      this.bounty_sales = 0.0;
      this.pledge_sales = 0.0;
      this.team_sales = 0.0;
      this.merch_sales = 0.0;
      this.refunds = 0.0;
      this.processing_fees = 0.0;
      this.refunded_fees = 0.0;
      this.cash_outs = 0.0;
      this.transfers = 0.0;

      this.bounty_liability = 0.0;
      this.pledge_liability = 0.0;
      this.team_liability = 0.0;
      this.cash_out_liability = 0.0;
      this.refund_liability = 0.0;
      this.tracker_liability = 0.0;

      this.splits = [];

      this.updateAttributes = function(data) {
        for (var key in data) {
          if (angular.isDefined(data[key])) {
            this[key] = parseFloat(data[key]);
          }
        }
      };

      this.updateSplits = function(splits) {
        this.splits = angular.copy(splits);
        for (var i=0; i<this.splits.length; i++) {
          this.splits[i].amount = parseFloat(this.splits[i].amount * -1);
        }
      };

      this.splitsTotal = function() {
        var total = 0;
        for (var i=0; i<this.splits.length; i++) {
          total += this.splits[i].amount;
        }
        return total;
      };
    };
  }])

  .factory('LiabilityReport', [function() {
    return function() {
      this.accounts = [];
      this.start_liability = 0.0;
      this.end_liability = 0.0;

      this.paypal_orders = 0.0;
      this.google_wallet_orders = 0.0;
      this.bank_of_america_orders = 0.0;
      this.paypal_cash_outs = 0.0;
      this.google_wallet_cash_outs = 0.0;
      this.bank_of_america_cash_outs = 0.0;

      this.updateAttributes = function(data) {
        for (var key in data) {
          if (angular.isDefined(data[key])) {
            this[key] = parseFloat(data[key]);
          }
        }
      };

      this.updateAccounts = function(accounts) {
        this.accounts = angular.copy(accounts);
        for (var i=0; i<this.accounts.length; i++) {
          this.accounts.balance = parseFloat(this.accounts);
        }
      };
    };
  }])

  .controller("ReportsController", ['$scope', '$routeParams', '$api', '$filter', '$location', 'Month', 'EscrowReport', 'LiabilityReport', function ($scope, $routeParams, $api, $filter, $location, Month, EscrowReport, LiabilityReport) {
    var now = new Date();
    var yearAndMonth = now.getFullYear() + '-' + ('0' + (now.getMonth()+1)).slice(-2) + '-';
    $scope.startDate = yearAndMonth + '01';
    $scope.endDate = yearAndMonth + ('0' + (now.getDate()+1)).slice(-2);

    $scope.sweepAccountText = 'Sweep Fee Accounts';
    $scope.sweepAccounts = function() {
      $scope.sweepAccountText = 'Sweeping...';
      $api.call('/admin/transactions/sweep', "POST", { sweep_date: $scope.selectedMonth.start_date }, function(response) {
        if (!response.meta.success) {
          $scope.sweepAccountText = 'Unknown Error!';
        } else if (response.data) {
          //$location.url("/admin/transactions/" + response.data.id);
          $scope.buildReports();
          $scope.sweepAccountText = 'Sweep Fee Accounts';
        } else {
          $scope.sweepAccountText = 'Hrm, nothing happened.';
        }
      });
    };

    $scope.paypalEscrowReport = new EscrowReport();
    $scope.googleWalletEscrowReport = new EscrowReport();
    $scope.bankOfAmericaEscrowReport = new EscrowReport();
    $scope.internalReport = new EscrowReport();

    $scope.activeTab = undefined;

    $scope.testActiveTab = function(name) {
      return $scope.activeTab === name;
    };

    $scope.setActiveTab = function(name) {
      $location.search({ tab: name });
      $scope.activeTab = name;
      return name;
    };

    $scope.setActiveTab($routeParams.tab || 'accounts');

    $scope.isLiabilityAccount = function(account_type) {
      return account_type.liability;
    };

    $scope.buildReports = function() {
      if ($scope.startDate && $scope.endDate) {
        var payload = {
          start_date: $scope.startDate,
          end_date: $scope.endDate
        };

        // PayPal Report
        // $api.call('/admin/report/paypal', payload, function(response) {
        //   console.log(response.data);
        //   $scope.paypalEscrowReport.updateAttributes(response.data);
        // });

        // PayPal Splits
        // $api.call('/admin/splits', angular.extend(angular.copy(payload), { account_id: 3 }), function(response) {
        //   $scope.paypalEscrowReport.updateSplits(response.data);
        // });

        // Google Wallet Report
        // $api.call('/admin/report/google_wallet', payload, function(response) {
        //   $scope.googleWalletEscrowReport.updateAttributes(response.data);
        // });

        // Google Wallet Splits
        // $api.call('/admin/splits', angular.extend(angular.copy(payload), { account_id: 284365 }), function(response) {
        //   $scope.googleWalletEscrowReport.updateSplits(response.data);
        // });

        // Bank of America Report
        // $api.call('/admin/report/bank_of_america', payload, function(response) {
        //   $scope.bankOfAmericaEscrowReport.updateAttributes(response.data);
        // });

        // Bank of America Splits
        // $api.call('/admin/splits', angular.extend(angular.copy(payload), { account_id: 284345 }), function(response) {
        //   $scope.bankOfAmericaEscrowReport.updateSplits(response.data);
        // });

        // Internal report
        // $api.call('/admin/report/liability', payload, function(response) {
        //   $scope.internalReport.updateAttributes(response.data);
        // });

//        // Fetch list of Accounts for Liability report
//        $api.call('/admin/report/accounts', payload, function(response) {
//          $scope.internalReport.updateAccounts(response.data);
//        });

        // Fetch list of Accounts for Liability report
        $api.call('/admin/report/all_account_balances', payload, function(response) {
          $scope.all_account_balances = response.data;

          $scope.sum_accounts_liability_start = 0.0;
          $scope.sum_accounts_bs_start = 0.0;
          $scope.sum_accounts_liability_end = 0.0;
          $scope.sum_accounts_bs_end = 0.0;
          for (var i=0; i < response.data.length; i++) {
            if (response.data[i].liability) {
              $scope.sum_accounts_liability_start += response.data[i].start_balance;
              $scope.sum_accounts_liability_end += response.data[i].end_balance;
            } else {
              $scope.sum_accounts_bs_start += response.data[i].start_balance;
              $scope.sum_accounts_bs_end += response.data[i].end_balance;
            }
          }

        });

      }
    };

  }]);
