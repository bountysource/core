with (scope('GoogleWallet', 'App')) {
  define('get_jwt', function(options, callback) {
    BountySource.api('/payments/google/item_jwt', 'GET', options, function(response) {
      if (response.meta.success) {
        GoogleWallet.items = GoogleWallet.items || {};
        GoogleWallet.items[options.id] = response.data.jwt;
      }
      callback(response.data.jwt);
    });
  });
}