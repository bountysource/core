angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/transactions/bank_transfers/new', {
        templateUrl: 'admin/transactions/new_bank_transfer.html',
        controller: "NewBankTransferTransaction"
      });
  })
  .controller("NewBankTransferTransaction", function ($location, $scope, $api) {
    $scope.accounts = [
      { id: 3, type: 'Account::Paypal', transaction_type: 'Transaction::CashOut::Paypal' },
      { id: 284345, type: 'Account::BofA', transaction_type: 'Transaction::CashOut::BankOfAmerica' },
      { id: 284365, type: 'Account::GoogleWallet', transaction_type: 'Transaction::CashOut::GoogleWallet' }
    ];

    $scope.form_data = {
      transaction_type: 'Transaction::BankTransfer',
      amount: null,
      from_account: $scope.accounts[0],
      to_account: $scope.accounts[1],
      description: null
    };

    $scope.generateTransactionDescription = function(form_data) {
      return 'Bank transfer from ' + form_data.from_account.type + '(' + form_data.from_account.id + ') to ' + form_data.to_account.type + '(' + form_data.to_account.id + ')';
    };

    // Watches item using strict equality, so that we can tell when any part of it changes.
    $scope.$watch('form_data', function(form_data) {
      if (form_data.from_account && form_data.to_account) {
        $scope.form_data.description = $scope.generateTransactionDescription(form_data);
      }
    }, angular.noop, true);

    $scope.createTransaction = function() {
      if (!$scope.form_data.from_account || !$scope.form_data.to_account) {
        return;
      }

      var form_data = angular.copy($scope.form_data);

      var payload = {
        type: form_data.transaction_type,
        description: form_data.description,
        audited: true,
        splits: {
          0: {
            amount: form_data.amount,
            account_id: form_data.to_account.id
          },

          1: {
            amount: -form_data.amount,
            account_id: form_data.from_account.id
          }
        }
      };

      $api.create_transaction(payload).then(function(response) {
        console.log(response);

        if (response.meta.success) {
          $location.path("/admin/transactions/" + response.data.id);
        } else {
          $scope.error = response.data.error;
        }
      });
    };

  });
