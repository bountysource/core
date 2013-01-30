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
      render({ target: 'breadcrumbs-fundraiser-title' }, a({ href: '#fundraisers/'+fundraiser_id }, abbreviated_text(fundraiser.title, 60)));

      // require the fundraiser to be published
      if (!fundraiser.published) return render({ into: target_div }, error_message('Fundraiser has not been published.'));

      render({ into: target_div },
        div({ 'class': 'split-main' },
          form({ 'class': 'fancy', action: curry(make_pledge, fundraiser) },
            fieldset({ 'class': 'no-label' },
              messages()
            ),

            fieldset(
              label('Pledge Amount:'),
              span({ style: 'font-size: 30px; vertical-align: middle; padding-right: 5px;' }, '$'),
              input({ id: 'pledge-amount', style: 'width: 240px; display: inline-block;', autofocus: true, name: 'amount', placeholder: '25', value: params.amount||'' })
            ),

            // payment method selection
            fieldset(
              label('Payment Source:'),
              Payment.payment_methods({ style: 'vertical-align: top;' })
            ),

            // rewards table
            fieldset(
              input({ id: 'reward-id', type: 'hidden', name: 'reward_id' }),

              label('Select Reward:'),
              div({ id: 'fundraiser-rewards', style: 'vertical-align: top; width: 500px;' },
                // No Reward option
                reward_row({
                  description: "No reward please, I just want to help out!"
                }),

                // populate the table with the actual rewards
                fundraiser.rewards.map(function(reward) {
                  return reward_row(reward);
                })
              )
            )
          )
        ),

        div({ 'class': 'split-side' }),
        div({ 'class': 'split-end' })
      );

      // if a reward id was passed in, select it now
      if (params.reward_id) {
        var e = document.getElementById('reward_'+params.reward_id+'_wrapper');
        if (e) e.click();
      }

      // if there are no rewards, automatically select the "No reward" options, which is always present.
      if (fundraiser.rewards.length <= 0) document.getElementById('fundraiser-rewards').children[0].click();

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

  define('reward_row', function(reward) {
    var reward_radio = radio({ id: 'reward_'+reward.id+'_radio', name: 'reward_id_radio', style: 'vertical-align: middle;' });
    var submit_button = div({ 'class': 'reward-submit-button', style: 'display: none; margin-top: 10px; text-align: center; padding-top: 10px; margin-top: 10px; border-top: 1px solid #AFECAF' },
      submit({ 'class': 'blue' }, "Continue to payment")
    );
    if (reward.sold_out) reward_radio.setAttribute('disabled', true);

    // if the id is set to 0, this is the "No Reward" row
    var no_reward = (typeof(reward.id) == 'undefined');

    var reward_element = div({ id: 'reward_'+reward.id+'_wrapper', style: 'padding: 15px;' },
      div({ style: 'display: inline-block; width: 400px; vertical-align: middle;' },
        div({ style: 'display: inline-block; width: 120px; vertical-align: top;' },
          div({ style: 'font-size: 16px;' },
            reward_radio,
            span({ style: 'vertical-align: middle; margin-left: 5px;' }, (no_reward ? 'No Reward' : (money(reward.amount)+' +')))
          )
        ),
        div({ style: 'display: inline-block; vertical-align: middle; width: 280px;' },
          (reward.limited_to > 0) && div({ style: 'margin-bottom: 10px; font-size: 14px;' },
            reward.sold_out && div({ style: 'color: #DF2525;' }, 'Sold out!'),
            div({ style: 'font-style: italic; text-decoration: '+(reward.sold_out ? 'line-through' : 'none')+';' },
              'Limited: ', formatted_number(reward.limited_to - (reward.claimed||0)), ' of ', formatted_number(reward.limited_to), ' left'
            )
          ),
          div({ style: 'line-height: 20px; white-space: pre-wrap;' }, reward.description)
        )
      ),
      div({ style: 'clear: both;' }),
      submit_button
    );

    if (reward.sold_out) {
      add_class(reward_element, 'sold-out');
    } else {
      reward_element.addEventListener('click', function(e) {
        // uncheck all radios
        flatten_to_array(document.getElementsByName('reward_id_radio')).forEach(function(e) {e.removeAttribute('checked'); });

        // check this radio
        reward_radio.setAttribute('checked','checked');

        // hide all submit buttons
        flatten_to_array(document.getElementsByClassName('reward-submit-button')).forEach(function(e) { hide(e); });

        // show this submit button
        show(submit_button);

        // set the pledge input with reward value if needed
        set_pledge_amount_from_reward(reward);
      });
    };

    return reward_element;
  })

  define('set_pledge_amount_from_reward', function(reward, e) {
    // set pledge amount from reward if it's empty, or iff the reward min pledge amount > current pledge amount
    var amount_input = document.getElementById('pledge-amount');
    if (!amount_input) return;

    var decline_reward = (typeof(reward.id) == 'undefined');

    // set the pledge value
    if (!decline_reward && (isNaN(parseInt(amount_input.value)) || parseInt(amount_input.value) < reward.amount)) {
      amount_input.value = reward.amount||'';
    }

    // change class of selected reward
    var reward_rows = document.getElementById('fundraiser-rewards').children;
    for (var i=0; i<reward_rows.length; i++) remove_class(reward_rows[i], 'active');
    var selected_reward = document.getElementById('reward_'+reward.id+'_wrapper');
    add_class(selected_reward, 'active');

    // set the hidden reward_id input
    document.getElementById('reward-id').value = (decline_reward ? 'no-reward' : reward.id);
  });

  define('make_pledge', function(fundraiser, form_data) {
    clear_message();
    if (form_data.reward_id != 'no-reward' && isNaN(parseInt(form_data.reward_id))) {
      return render_message(error_message('Please select your reward first'));
    }

    var payment_data = {
      amount:  form_data.amount,
      payment_method: form_data.payment_method,
      item_number: 'fundraisers/' + fundraiser.id + (parseInt(form_data.reward_id) > 0 ? '/'+form_data.reward_id : ''),
      success_url: window.location.href.split('#')[0] + '#fundraisers/'+fundraiser.id+'/pledges/:item_id/receipt',
      cancel_url: window.location.href.split('#')[0] + Fundraisers.get_href(fundraiser)
    };

    BountySource.make_payment(payment_data, function(response) {
      if (response.meta.success) {
        if (form_data.payment_method == 'personal') BountySource.set_cached_user_info(null);
        set_route(response.data.redirect_url);
      } else {
        render_message(error_message(response.data.error));
      }
    });
  });
}