angular.module('app').controller('AccountSettings', function($scope, $api, $location, $window, Person, Web3Utils, $log) {
  $scope.set_post_auth_url = function() {
    $api.set_post_auth_url($location.url());
  };

  $scope.github_link = $api.signin_url_for('github');
  $scope.twitter_link = $api.signin_url_for('twitter');
  $scope.facebook_link = $api.signin_url_for('facebook');
  $scope.isCollapsed = true;
  $scope.addNew = false;
  $scope.wallets = $scope.current_person.wallets;


  $scope.form_data = {};
  $scope.change_password = function() {
    $scope.error = $scope.success = null;

    var req = {
      current_password: $scope.form_data.current_password,
      new_password: $scope.form_data.new_password,
      password_confirmation: $scope.form_data.new_password
    };
    $api.change_password(req).then(function(response) {
      if (response.error) {
        $scope.error = response.error;
      } else {
        $scope.success = 'Successfully updated password!';
      }
    });
  };

  $scope.forgot_password = function() {
    $api.request_password_reset({ email: $scope.current_person.email }).then(function(response) {
      $scope.info = response.message;
    });
  };

  $scope.unlink_account = function(account_type) {
    Person.update({ id: $scope.current_person.id, unlink_account: account_type }, function() {
      $window.document.location.reload();
    });
  };

  $scope.delete_addr = function(wallet){
    $scope.success = null;
    $scope.error = null;
    $api.v2.deleteWallet(wallet.eth_addr)
      .then(function (response){ if (response.success) {
        $scope.success = "Successfully deleted wallet";
        $scope.wallets = angular.copy(response.data);
        } else {
          $scope.error = response.data.error;
        }
      });
  }; 

  $scope.add_addr = function(){
    $scope.success = null;
    $scope.error = null;
    var walletParams = { person_id: $scope.current_person.id, label: $scope.form_data.addr_label, eth_addr: $scope.form_data.eth_addr }
    console.log(walletParams)
    $api.v2.wallets(walletParams)
      .then(function (response){ 
        if (response.success) {
          $scope.success = "Successfully updated wallet";
          $scope.wallets = angular.copy(response.data);
          $scope.addNew = false;
        } else {
          $scope.error = response.data.error;
        }
      });
  }; 

  $scope.disp_addbox = function(){
    $scope.success = null;
    $scope.error = null;
    $scope.wallets = false;
    $scope.addNew = true;
  };

  $scope.validate_addr = function(){
    $scope.success = null;
    $scope.error = null;
    Web3Utils.verifyAddress().then(function(signedTxn) {
      $api.v2.metamask({ person_id: $scope.current_person.id, label: $scope.form_data.addr_label, eth_addr: $scope.form_data.eth_addr, signed_txn: signedTxn }).then(function (response){ 
          if (response.success) {
            $scope.success = "Successfully updated wallet";
            $scope.wallets = angular.copy(response.data);
            $scope.addNew = false;
          } else {
            $scope.error = "Unable to update wallet or address not verified";
          }
      });
    }).catch(function(error){
      $log.error('Error when validating ETH addrs ' + error);
    });
  };


});
