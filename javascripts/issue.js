with (scope('Issue','App')) {
  // get the link for an issue object
  define('get_href', function(issue) {
    return '#/repos/'+issue.repository.full_name+'/issues/'+issue.number;
  });

  // render a pretty 'open' or 'closed' element
  define('status_element', function(issue) {
    return span({ style: 'font-size: 16px;' },
      issue.state == 'open' ? span({ style: 'background: #83d11a; border-radius: 4px; padding: 4px; color: white' }, 'Open') : span({ style: 'background: #D11A1A; border-radius: 4px; padding: 4px; color: white' }, 'Closed')
    );
  });

  // create the donation box
  define('donation_box', function() {
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

    return div({ id: 'bounty-box' },
      div({ style: 'padding: 0 21px' }, ribbon_header("Backers")),

      issue.bounty_amount > 0 && section(
        div({ 'class': 'total_bounties' }, money(issue.bounty_amount)),
        div({ style: 'text-align: center' }, "From ", issue.bounties.length, " bount" + (issue.bounties.length == 1 ? 'y' : 'ies') + ".")


        // issue.bounties && (issue.bounties.length > 0) && div(
        //   issue.bounties.map(function(bounty) {
        //     return div(money(bounty.amount));
        //   })
        // )
      ),

      section({ style: 'padding: 21px' },
        form({ action: curry(create_bounty, issue.repository.owner, issue.repository.name, issue.number) },
          div({ id: 'create-bounty-errors' }),

          div({ 'class': 'amount' },
            label({ 'for': 'amount-input' }, '$'),
            text({ placeholder: "25", name: 'amount', id: 'amount-input' })
          ),
          div({ 'class': 'payment-method' },
            div(radio({ name: 'payment_method', value: 'paypal', checked: 'checked',
              id: 'payment_method_paypal' }),
              label({ 'for': 'payment_method_paypal' },
                img({ src: 'images/paypal.png'}), "PayPal")),
            div({ title: 'Coming soon!' },
              radio({ disabled: true, name: 'payment_method', value: 'google',
                id: 'payment_method_google' }),
              label({ style: 'color: #C2C2C2;', 'for': 'payment_method_google' },
                img({ src: 'images/google-wallet.png'}), "Google Wallet")),
            div({ title: 'Coming soon!' },
              radio({ disabled: true, name: 'payment_method', value: 'amazon',
                id: 'payment_method_amazon' }),
              label({ style: 'color: #C2C2C2;', 'for': 'payment_method_amazon' },
                img({ src: 'images/amazon.png'}), "Amazon.com")),

            bountysource_account_div
          ),
          submit({ 'class': 'blue' }, 'Create Bounty')
        )
      )
    );
  });
}