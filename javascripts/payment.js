with (scope('Payment', 'App')) {

  define('create', function(data, error_callback) {
    var callback = function(response) {
      if (response.meta.success) {
        if (data.payment_method == 'personal') BountySource.set_cached_user_info(null);
        if (data.payment_method == 'google') {
          var jwt = response.data.jwt;

          // now that we have the JWT, trigger the buy!
          window.google.payments.inapp.buy({
            jwt: jwt,

            success: function() {
              console.log(arguments);
            },

            failure: function() {
              console.log(arguments);
              // set_route(fundraiser.frontend_path);
            }
          });

        } else {
          set_route(response.data.redirect_url);
        }
      } else {
        error_callback(response.data.error);
      }
    };

    var non_auth_callback = function() {
      Storage.set('_redirect_to_after_login', data.postauth_url);
      set_route('#signin');
    };

    BountySource.api('/payments', 'POST', data, callback, non_auth_callback);
  });

  define('payment_methods', function(options) {
    options = options || {};
    options['class'] = 'payment-method';

    var selected_value = options.value || 'paypal';
    delete options.value;

    var authed_accounts_div = div();

    var payment_methods = div(options,
      div(
        radio({
          id: 'payment_method_paypal',
          name: 'payment_method',
          value: 'paypal',
          checked: (selected_value == 'paypal' ? 'checked' : null)
        }),
        label({ 'for': 'payment_method_paypal', style: 'display: inline;' },
          img({ src: 'images/paypal.png'}), span("PayPal")
        )
      ),
      div(
        radio({
          id:'payment_method_google',
          name: 'payment_method',
          value: 'google',
          checked: (selected_value == 'google' ? 'checked' : null)
        }),
        label({ 'for': 'payment_method_google', style: 'display: inline;' },
          img({ src: 'images/google-wallet.png'}), span("Google Wallet")
        )
      ),
      false && div(
        radio({
          id:'payment_method_amazon',
          name: 'payment_method',
          value: 'amazon',
          checked: (selected_value == 'amazon' ? 'checked' : null)
        }),
        label({ 'for': 'payment_method_amazon', style: 'display: inline;' },
          img({ src: 'images/amazon.png'}), span("Amazon.com")
        )
      ),

      authed_accounts_div
    );

    // if logged in and account has money, render bountysource and gittip payment options
    if (logged_in()) {
      BountySource.get_cached_user_info(function(user) {
        var bountysource_account_div = div();
        var gittip_account_div = div();

        if (user.account && user.account.balance > 0) {
          render({ into: bountysource_account_div },
            // Internal Bountysource account
            div(
              radio({
                name: 'payment_method',
                value: 'personal',
                id: 'payment_method_personal',
                checked: (selected_value == 'personal' ? 'checked' : null)
              }),
              label({ 'for': 'payment_method_personal', style: 'display: inline;' },
                img({ src: user.image_url, style: 'width: 16px; height: 16px' }),
                span("Bountysource"), span({ style: "color: #888; font-size: 80%" }, " (" + money(user.account.balance, true) + ")")
              )
            )
          );
        }

        // Gittip account
        if (user.gittip_account && user.gittip_account.account_balance > 0) {
          render({ into: gittip_account_div },
            div(
              radio({
                name: 'payment_method',
                value: 'gittip',
                id: 'payment_method_gittip',
                checked: (selected_value == 'gittip' ? 'checked' : null)
              }),
              label({ 'for': 'payment_method_gittip', style: 'display: inline;' },
                img({ src: 'images/gittip.16.png', style: 'width: 16px; height: 16px' }),
                span("Gittip"), span({ style: "color: #888; font-size: 80%" }, " (" + money(user.gittip_account.account_balance, true) + ")")
              )
            )
          );
        }

        render({ into: authed_accounts_div },
          bountysource_account_div,
          gittip_account_div
        );
      });
    }

    return payment_methods;
  });

}
