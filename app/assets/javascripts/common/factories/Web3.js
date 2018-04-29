angular.module('factories').factory('Web3Utils', function ($window, $log, $env, $q) {

    var web3,
        Web3Utils = {};

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof $window.web3 !== 'undefined') {
        $log.warn(
            'Using web3 detected from external source. If you find that your accounts don\'t appear ensure you\'ve configured that source properly. ' +
            'If using MetaMask, see the following link - http://truffleframework.com/tutorials/truffle-and-metamask'
        );
        // Use Mist/MetaMask's provider
        web3 = new Web3(Web3.givenProvider);

    } else {
        $log.warn(
            'No web3 detected. Unlock Metamask! '
        );
    }

    Web3Utils.isValidNetwork = function() {
        web3.eth.net.getId().then(function(networkId){
            if(networkId === $env.web3_provider_network_id){
                $log.info('Metamask configured on correct network!! Network id is ' + netId);
                return true;
            }
            $log.info('Metamask configured on incorrect network!! Network id is ' + netId);
            return false;
        });
    }

    Web3Utils.getAccounts = function() {
        web3.eth.getAccounts().then(function(accounts){
            $log.info('ETH Accounts: ' + accounts);
            return accounts;
        }).catch(function(error){
            $log.error('Error getting accounts from provider ' + error);
        });
    }

    Web3Utils.getEthBalance = function(address) {
        web3.eth.getBalance(address).then(function(balance) {
            var stringBalance = web3.utils.fromWei(balance, 'ether');
            $log.info('Balance: ' + stringBalance + ' ether');
            return stringBalance;
        }).catch(function(error){
            $log.error('Error getting account balance ' + error);
        });
    }

    Web3Utils.sendTransaction = function(ethValue, recipient) {
        web3.eth.net.getId().then(function(networkId){
            if(networkId === $env.web3_provider_network_id){
                $log.info('Metamask configured on correct network!! Network id is ' + networkId);
                return web3.eth.getAccounts();
            }else{
                $log.info('Metamask configured on incorrect network!! Network id is ' + networkId);
            }
        }).then(function(accounts) {
            var from = accounts[0],
                value = web3.utils.toWei(ethValue, 'ether');
            $log.info('Value in Wei is: ' + value.toString());
            var transaction = {
                from: from,
                gas: 21000,
                to: recipient,
                value: value
            };
            $log.info('Transaction object : ' + JSON.stringify(transaction));
            web3.eth.getGasPrice().then(function(gasPrice) {
                $log.info('Gas price is: ' + gasPrice.toString());
                transaction.gasPrice = gasPrice;
                $log.info('Transaction object is after adding gas price: ' + JSON.stringify(transaction));
                return web3.eth.sendTransaction(transaction);
            }).then(function(receipt){
                $log.info('Transaction receipt is: ' + JSON.stringify(receipt));
            }).catch(function(error){
                $log.error('Error sending transaction ' + error);
            });
        }).catch(function(error){
            $log.error('Error sending transaction ' + error);
        });
    }

    Web3Utils.verifyAddress = function() {
        var deferred = $q.defer();
        web3.eth.net.getId().then(function(networkId){
            if(networkId === $env.web3_provider_network_id){
                $log.info('Metamask configured on correct network!! Network id is ' + networkId);
                return web3.eth.getAccounts();
            }else{
                var errorMsg = 'Metamask configured on incorrect network!! Network id is ' + networkId;
                $log.error(errorMsg);
                deferred.reject(new Error(errorMsg));
            }
        }).then(function(accounts) {
            var from = accounts[0];
            var msgParams = [
                {
                    type: 'string',
                    name: 'Message',
                    value: 'By signing this transaction, I prove my ownership of account ' + from
                }
            ]
            var eth = new Eth(web3.currentProvider);
            eth.signTypedData(msgParams, from).then(function(signed) {
                console.log('Signed!  Result is: ', signed);
                deferred.resolve(signed);
                // console.log('Recovering...');
                // var recovered = sigUtil.recoverTypedSignature({ data: msgParams, sig: signed });
                // recovered = web3.utils.toChecksumAddress(recovered);
                // $log.info('Recovered signer as ' + recovered);
                // if (recovered === from ) {
                //     $log.info('Successfully ecRecovered signer as ' + recovered);
                //     deferred.resolve(from);
                //     //Post verified address to DBjhuk
                // } else {
                //     var errorMsg = 'Failed to verify signer when comparing ' + signed + ' to ' + from;
                //     $log.error(errorMsg);
                //     deferred.reject(new Error(errorMsg));
                // }
            }).catch(function(error){
                var errorMsg = 'Error verifying account ' + error;
                $log.error(errorMsg);
                deferred.reject(new Error(errorMsg));
            });
        }).catch(function(error){
            var errorMsg = 'Error verifying account ' + error;
            $log.error(errorMsg);
            deferred.reject(new Error(errorMsg));
        });
        return deferred.promise;
    }

    return Web3Utils;
});