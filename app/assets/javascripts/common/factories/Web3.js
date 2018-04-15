angular.module('factories').factory('Web3', function ($window, $log, $env) {

    var web3Provider,
        Web3 = {};

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof $window.web3 !== 'undefined') {
        $log.warn(
            'Using web3 detected from external source. If you find that your accounts don\'t appear ensure you\'ve configured that source properly. ' +
            'If using MetaMask, see the following link - http://truffleframework.com/tutorials/truffle-and-metamask'
        );
        // Use Mist/MetaMask's provider
        web3Provider = new ethers.providers.Web3Provider($window.web3.currentProvider, $env.web3_provider_network);

    } else {
        $log.warn(
            'No web3 detected. Unlock Metamask! '
        );
    }

    Web3.getAccount = function() {
        web3Provider.listAccounts().then(function(value){
            return value;
            $log.info('Inside list accounts: ' + value);
        }).catch(function(error){
            $log.error('Error getting accounts from provider ' + error);
        });
    }

    Web3.getEthBalance = function(address) {
        web3Provider.getBalance(address).then(function(balance) {
            var stringBalance = $window.ethers.utils.formatEther(balance);
            $log.info('Balance: ' + stringBalance);
            return stringBalance;
        }).catch(function(error){
            $log.error('Error getting account balance ' + error);
        });
    }

    Web3.getCheckSumAddress = function(address) {
        return ethers.utils.getAddress(address);
    }

    Web3.verifyAddress = function() {

        web3Provider.listAccounts().then(function(accounts) {

            var from = accounts[0];

            var msgParams = [
                {
                    type: 'string',
                    name: 'Message',
                    value: 'By signing this transaction, I prove my ownership of account ' + from
                }
            ]

            var eth = new Eth(web3.currentProvider)

            eth.signTypedData(msgParams, from).then(function(signed) {
                console.log('Signed!  Result is: ', signed)
                console.log('Recovering...')

                var recovered = sigUtil.recoverTypedSignature({ data: msgParams, sig: signed })
                recovered = Web3.getCheckSumAddress(recovered);
                $log.info('Recovered signer as ' + recovered)

                if (recovered === from ) {
                    $log.info('Successfully ecRecovered signer as ' + recovered)

                    //Post verified address to DB

                } else {
                    $log.error('Failed to verify signer when comparing ' + signed + ' to ' + from)
                }

            }).catch(function(error){
                $log.error('Error verifying account ' + error);
            });
        }).catch(function(error){
            $log.error('Error verifying account ' + error);
        });
    }

    return Web3;

});