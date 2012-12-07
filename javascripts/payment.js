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
        div({ 'class': 'payment-method' },
          div(radio({ name: 'payment_method', value: 'paypal', id:'payment_method_paypal',
            checked: 'checked' }),
            label({ 'for': 'payment_method_paypal' },
              img({ src: 'images/paypal.png'}), "PayPal")),
          div(radio({ name: 'payment_method', value: 'google', id:'payment_method_google' }),
            label({ 'for': 'payment_method_google' },
              img({ src: 'images/google-wallet.png'}), "Google Wallet")),
    //            div(radio({ name: 'payment_method', value: 'amazon', id:'payment_method_amazon' }),
    //                label({ 'for': 'payment_method_amazon' },
    //                      img({ src: 'images/amazon.png'}), "Amazon.com")),

          bountysource_account_div
        ),
        submit({ 'class': 'blue' }, 'Create ' + item)
      )
    );
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
