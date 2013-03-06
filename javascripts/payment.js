with (scope('Payment', 'App')) {

  define('payment_methods', function(options) {
    options = options || {};
    options['class'] = 'payment-method';

    var selected_value = options.value || 'paypal';
    delete options.value;

    var bountysource_account_div = div();

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
      false && div(
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
      bountysource_account_div
    );

    // if logged in and account has money, render bountysource account radio
    logged_in() && BountySource.get_cached_user_info(function(user) {
      (user.account && user.account.balance > 0) && render({ into: bountysource_account_div },
        div(
          radio({
            name: 'payment_method',
            value: 'personal',
            id: 'payment_method_personal',
            checked: (selected_value == 'personal' ? 'checked' : null)
          }),
          label({ 'for': 'payment_method_personal', style: 'display: inline;' },
            img({ src: user.image_url, style: 'width: 16px; height: 16px' }),
            span("BountySource"), span({ style: "color: #888; font-size: 80%" }, " (" + money(user.account.balance) + ")")
          )
        )
      );
    });

    return payment_methods;
  });

}
