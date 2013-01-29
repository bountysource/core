with (scope('Payment', 'App')) {
  define('payment_box', function(payment_data) {
    return section({ style: 'padding: 21px' },

      form({ action: curry(make_payment, payment_data) },

        div({ id: 'create-bounty-errors' }),

        div({ 'class': 'amount' },
          label({ 'for': 'amount-input' }, '$'),
          text({ placeholder: "25", name: 'amount', id: 'amount-input' })
        ),

        payment_methods({ style: 'margin: 10px 0;' }),

        submit({ 'class': 'blue' }, 'Create Bounty')
      )
    );
  });

  define('payment_methods', function(options) {
    options = options || {};
    options['class'] = 'payment-method';

    var bountysource_account_div = div();

    var payment_methods = div(options,
      div(
        radio({
          id: 'payment_method_paypal',
          name: 'payment_method',
          value: 'paypal',
          checked: 'checked'
        }),
        label({ 'for': 'payment_method_paypal', style: 'display: inline;' },
          img({ src: 'images/paypal.png'}), span("PayPal")
        )
      ),
      false && div(
        radio({
          id:'payment_method_google',
          name: 'payment_method',
          value: 'google'
        }),
        label({ 'for': 'payment_method_google', style: 'display: inline;' },
          img({ src: 'images/google-wallet.png'}), span("Google Wallet")
        )
      ),
      false && div(
        radio({
          id:'payment_method_amazon',
          name: 'payment_method',
          value: 'amazon'
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
            id: 'payment_method_personal'
          }),
          label({ 'for': 'payment_method_personal', style: 'display: inline;' },
            img({ src: user.avatar_url, style: 'width: 16px; height: 16px' }),
            span("BountySource"), span({ style: "color: #888; font-size: 80%" }, " (" + money(user.account.balance) + ")")
          )
        )
      );
    });

    return payment_methods;
  });

  define('make_payment', function(payment_data, form_data) {
    // load in amount and payment_method selector
    payment_data.amount = form_data.amount;
    payment_data.payment_method = form_data.payment_method;

    BountySource.make_payment(payment_data, function(response) {
      if (response.meta.success) {
        if (payment_data.payment_method == 'personal') BountySource.set_cached_user_info(null);
        set_route(response.data.redirect_url);
      } else {
        render({ target: 'create-bounty-errors' }, error_message(response.data.error));
      }
    });
  });

}
