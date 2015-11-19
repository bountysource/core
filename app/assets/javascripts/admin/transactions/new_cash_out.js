angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/transactions/cash_outs/new', {
        templateUrl: 'admin/transactions/new_cash_out.html',
        controller: "NewCashOutTransaction"
      });
  })
  .controller("NewCashOutTransaction", function ($location, $scope, $api) {
    $scope.payment_methods = [
      { id: 3, type: 'Account::Paypal', transaction_type: 'Transaction::CashOut::Paypal' },
      { id: 284345, type: 'Account::BofA', transaction_type: 'Transaction::CashOut::BankOfAmerica' },
      { id: 284365, type: 'Account::GoogleWallet', transaction_type: 'Transaction::CashOut::GoogleWallet' }
    ];

    $scope.payment_source_types = [
      'Person',
      'Team'
    ];

    $scope.form_data = {
      amount: null,
      payment_method: $scope.payment_methods[0],
      payment_source: {
        type: $scope.payment_source_types[0],
        id: null
      },
      items: [],
      description: null
    };

    $scope.item_types = [
      'BountyClaim',
      'Fundraiser'
    ];

    $scope.new_item = {
      type: $scope.item_types[0],
      id: null
    };

    // Add item to the Transaction
    $scope.addNewItem = function() {
      if ($scope.new_item.type && $scope.new_item.id) {
        $scope.form_data.items.push(angular.copy($scope.new_item));
        $scope.initializeNewItem();
      }
    };

    $scope.removeItem = function(item) {
      for (var i=0; i<$scope.form_data.items.length; i++) {
        if ($scope.form_data.items[i].id === item.id) {
          $scope.form_data.items.splice(i,1);
          break;
        }
      }
    };

    $scope.initializeNewItem = function() {
      $scope.new_item = {
        type: $scope.item_types[0],
        id: undefined
      };
    };

    // Initialize new item
    $scope.initializeNewItem();

    $scope.generateTransactionDescription = function(form_data) {
      var description = 'Cash out to ' + form_data.payment_source.type + '(' + form_data.payment_source.id + ')';
      if (form_data.items.length > 0) {
        var item_names = [];
        for (var i=0; i<form_data.items.length; i++) {
          item_names.push(form_data.items[i].type + '(' + form_data.items[i].id + ')');
        }
        description += ' for [' + item_names.join(', ') + ']';
      }
      return description;
    };

    // Watches item using strict equality, so that we can tell when any part of it changes.
    $scope.$watch('form_data', function(form_data) {
      $scope.form_data.description = $scope.generateTransactionDescription(form_data);
    }, angular.noop, true);

    $scope.createTransaction = function() {
      if (!$scope.form_data.payment_method || !$scope.form_data.payment_source) {
        return;
      }

      var form_data = angular.copy($scope.form_data);
      var payload = {
        type: form_data.payment_method.transaction_type,
        description: form_data.description,
        audited: true,
        splits: {
          0: {
            amount: form_data.amount,
            account_id: form_data.payment_method.id,
            item_id: form_data.payment_source.id,
            item_type: form_data.payment_source.type
          },

          1: {
            amount: -form_data.amount,
            item_id: form_data.payment_source.id,
            item_type: form_data.payment_source.type
          }
        }
      };

      $api.create_transaction(payload).then(function(response) {
        if (response.meta.success) {
          $location.path("/admin/transactions/"+response.data.id);
        } else {
          $scope.error = response.data.error;
        }
      });
    };

  });
