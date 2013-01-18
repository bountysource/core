with (scope('Fundraisers', 'App')) {
  route('#fundraisers/:fundraiser_id/pledge', function(fundraiser_id) {
    var target_div = div('Loading...'),
      bountysource_account_div = div();

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'Fundraisers',
        span({ id: 'breadcrumbs-fundraiser-title' }, 'Loading...'),
        'Make Pledge'
      ),
      target_div
    );

    BountySource.get_fundraiser(fundraiser_id, function(response) {
      var params = get_params(),
          fundraiser = response.data;

      // render the title of the fundraiser into header
      render({ target: 'breadcrumbs-fundraiser-title' }, a({ href: '#fundraisers/'+fundraiser_id }, response.data.title));

      // require the fundraiser to be published
      if (!fundraiser.published) return render({ into: target_div }, error_message('Fundraiser has not been published.'));

      render({ into: target_div },
        div({ 'class': 'split-main' },
          form({ 'class': 'fancy', action: curry(make_pledge, fundraiser) },
            messages(),

            fieldset(
              label('Pledge Amount:'),
              span({ style: 'font-size: 30px; vertical-align: middle; padding-right: 5px;' }, '$'), input({ id: 'pledge-amount', autofocus: true, name: 'amount', placeholder: '25', value: params.amount||'' })
            ),

            // payment method selection
            fieldset({ 'class': 'no-label' },
              div({ 'class': 'payment-method' },
                div(
                  radio({
                    name:     'payment_method',
                    value:    'paypal',
                    id:       'payment_method_paypal',
                    checked:  'checked'
                  }),
                  label({ 'for': 'payment_method_paypal', style: 'text-align: left; padding-left: 15px;' },
                    img({ src: 'images/paypal.png'}), "PayPal"
                  )
                ),
//              div(
//                radio({
//                  name:   'payment_method',
//                  value:  'google',
//                  id:     'payment_method_google'
//                }),
//                label({ 'for': 'payment_method_google', style: 'text-align: left; padding-left: 15px;' },
//                  img({ src: 'images/google-wallet.png'}), "Google Wallet"
//                )
//              ),
                bountysource_account_div
              )
            ),

            // rewards table
            fieldset({ 'class': 'no-label' },
              (fundraiser.rewards.length > 0) && div(
                input({ id: 'reward-id', type: 'hidden', name: 'reward_id' }),

                h3('Select Your Reward'),
                rewards_table(fundraiser)
              )
            )
          )
        ),

        div({ 'class': 'split-side' }),

        div({ 'class': 'split-end' })
      );

      // if a reward id was passed in, select it now
      if (params.reward_id) {
        fundraiser.rewards.forEach(function(reward) {
          if (reward.id == parseInt(params.reward_id)) return set_pledge_amount_from_reward(reward);
        });
      }

      // if logged in and account has money, render bountysource account radio
      logged_in() && BountySource.get_cached_user_info(function(user) {
        (user.account && user.account.balance > 0) && render({ into: bountysource_account_div },
          div(
            radio({
              name: 'payment_method',
              value: 'personal',
              id: 'payment_method_personal'
            }),
            label({ 'for': 'payment_method_personal', style: 'text-align: left; padding-left: 15px; display: inline;' },
              img({ src: user.avatar_url, style: 'width: 16px; height: 16px' }),
              "BountySource",
              span({ style: "color: #888; font-size: 80%" }, " (" + money(user.account.balance) + ")")
            )
          )
        );
      });
    });
  });

  define('rewards_table', function(fundraiser) {
   return div({ id: 'fundraiser-rewards', style: 'background: #EEE; margin: 10px 0; border-radius: 3px; box-shadow: 0 0 10px silver;' },
      (function() {
        var elements = [];
        for (var i=0; i<fundraiser.rewards.length; i++) {
          var reward = fundraiser.rewards[i];
          var element = div({ id: 'reward_'+reward.id+'_wrapper', style: 'min-height: 100px; padding: 15px;', onClick: curry(set_pledge_amount_from_reward, reward) },
            div({ style: 'display: inline-block; width: 400px; vertical-align: middle;' },
              span({ style: 'font-size: 25px;' }, 'Pledge ', money(reward.amount), ' +'),

              // TODO show number remaining if quantity limited
              (reward.limited_to > 0) && p({ style: 'margin-left: 10px; font-size: 14px; font-style: italic;' }, 'Limited: ', formatted_number(reward.limited_to - (reward.num_claimed||0)), ' of ', formatted_number(reward.limited_to), ' left'),

              p({ style: 'margin-left: 10px;' }, reward.description)
            ),

            div({ class: 'reward-continue-button', id: 'reward_'+reward.id+'_continue_button', style: 'float: right; width: 200px; display: none;' },
              submit({ 'class': 'green' }, 'Continue')
            ),

            div({ style: 'clear: both;' })
          );

          if (i < (fundraiser.rewards.length-1)) element.style['border-bottom'] = '2px dotted #C7C7C7';
          elements.push(element);
        }
        return elements;
      })()
    );
  });

  define('set_pledge_amount_from_reward', function(reward, e) {
    // set pledge amount from reward if it's empty, or iff the reward min pledge amount > current pledge amount
    var amount_input = document.getElementById('pledge-amount');

    if (!amount_input) return;

    amount_input.value = reward.amount;

    // change class of selected reward
    var reward_rows = document.getElementById('fundraiser-rewards').children;
    for (var i=0; i<reward_rows.length; i++) remove_class(reward_rows[i], 'active');
    var selected_reward = document.getElementById('reward_'+reward.id+'_wrapper');
    add_class(selected_reward, 'active');

    // show the continue button on the selected reward row
    var reward_continue_buttons = document.getElementsByClassName('reward-continue-button');
    for (var i=0; i<reward_continue_buttons.length; i++) hide(reward_continue_buttons[i]);
    show(document.getElementById('reward_'+reward.id+'_continue_button'));

    // set the hidden reward_id input
    document.getElementById('reward-id').value = reward.id;
  });

  define('make_pledge', function(fundraiser, form_data) {
    // select reward
    var reward;
    fundraiser.rewards.forEach(function(r) { if (r.id == parseInt(form_data.reward_id)) reward = r });

    if (!reward) {
//      // missing reward
//      alert('No reward selected.');
//    } else if (reward.amount > parseInt(form_data.amount)) {
//      // amount less than that required by reward
//      alert('You need to pledge at least ' + money(parseInt(reward.amount)) + ' to claim the selected reward.');
//    } else if (reward.sold_out) {
//      // reward sold out
//      alert('The selected reward is no longer available.');
    } else {
      // build the redirect_url, with pledge_id placeholder
      form_data.redirect_url = form_data.redirect_url || BountySource.www_host+'#fundraisers/'+fundraiser.id+'/pledges/:pledge_id/receipt';

      BountySource.make_pledge(fundraiser.id, form_data, function(response) {
        if (response.meta.success) {
          if (form_data.payment_method == 'personal') BountySource.set_cached_user_info(null);
          window.location.href = response.data.redirect_url;
        } else {
          // render_message(error_message(response.data.error));
          alert(response.data.error);
        }
      });
    }
  });
}