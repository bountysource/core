with (scope('Payment', 'App')) {
  define('payment_box', function(item, repository, issue_number, redirect_url) {
    var bountysource_account_div = div();

    logged_in() && BountySource.get_cached_user_info(function(user) {
      if (user.account && user.account.balance > 0) {
        render({ into: bountysource_account_div },
          radio({ name: 'payment_method', value: 'personal', id: 'payment_method_account' }),
          label({ 'for': 'payment_method_account', style: 'white-space: nowrap;' },
            img({ src: user.avatar_url, style: 'width: 16px; height: 16px' }),
            "BountySource",
            span({ style: "color: #888; font-size: 80%" }, " (" + money(user.account.balance) + ")")
          )
        );
      }
    });

    return section({ style: 'padding: 21px' },

      form({ action: curry(make_payment, item, repository, issue_number, redirect_url) },

        div({ id: 'create-bounty-errors' }),

        div({ 'class': 'amount' },
          label({ 'for': 'amount-input' }, '$'),
          text({ placeholder: "25", name: 'amount', id: 'amount-input' })
        ),

        payment_methods(),

        submit({ 'class': 'blue' }, 'Create ' + item)
      )
    );
  });

  define('payment_methods', function() {
    var bountysource_account_div = div();

    var payment_methods = div({ 'class': 'payment-method' },
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

  define('make_payment', function(item, repository, issue_number, redirect_url, form_data) {
    var payment_method = form_data.payment_method;
    var amount = form_data.amount;

    BountySource.make_payment(item, repository.full_name, issue_number, amount, payment_method, redirect_url, function(response) {
      if (response.meta.success) {
        if (payment_method == 'personal') BountySource.set_cached_user_info(null);

        // redirect to Paypal, Google Checkout
        window.location.href = response.data.redirect_url;
      } else {
        render({ target: 'create-bounty-errors' }, error_message(response.data.error));
      }
    });
  });

}
