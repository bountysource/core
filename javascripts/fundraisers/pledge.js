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
              span({ style: 'font-size: 30px; vertical-align: middle; padding-right: 5px;' }, '$'),
              input({ id: 'pledge-amount', style: 'width: 240px; display: inline-block;', autofocus: true, name: 'amount', placeholder: '25', value: params.amount||'' }),
              submit({ 'class': 'green', style: 'display: inline-block; height: 60px;' }, 'Continue to payment')
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
    // add extra row for specifying no reward
    fundraiser.rewards = flatten_to_array([{
      title:       'No reward',
      description: "I don't need a reward, but I would still like to help out!",
      id:          -1
    }, fundraiser.rewards]);

    return div({ id: 'fundraiser-rewards', style: 'background: #EEE; margin: 10px 0; border-radius: 3px; box-shadow: 0 0 10px silver;' },
     (function() {
       var elements = [];
       for (var i=0; i<fundraiser.rewards.length; i++) {
         var reward = fundraiser.rewards[i];
         var element = reward_row(reward);
         if (i < (fundraiser.rewards.length-1)) element.style['border-bottom'] = '2px dotted #C7C7C7';
         elements.push(element);
       }
       return elements;
     })()
    );
  });

  define('reward_row', function(reward) {
    // if id is set to negative value, user does not want a reward
    var decline_reward = reward.id < 0;

    return div({ id: 'reward_'+reward.id+'_wrapper', style: 'min-height: 100px; padding: 15px;', onClick: curry(set_pledge_amount_from_reward, reward) },
      div({ style: 'display: inline-block; width: 400px; vertical-align: middle;' },
        span({ style: 'font-size: 25px;' }, decline_reward ? 'No reward' : ('Pledge '+money(reward.amount)+' +')),

        (!decline_reward && reward.limited_to > 0) && p({ style: 'margin-left: 10px; font-size: 14px; font-style: italic;' }, 'Limited: ', formatted_number(reward.limited_to - (reward.claimed||0)), ' of ', formatted_number(reward.limited_to), ' left'),

        p({ style: 'margin-left: 10px;' }, reward.description)
      ),

      div({ style: 'clear: both;' })
    );
  })

  define('set_pledge_amount_from_reward', function(reward, e) {
    // set pledge amount from reward if it's empty, or iff the reward min pledge amount > current pledge amount
    var amount_input = document.getElementById('pledge-amount');
    if (!amount_input) return;

    var decline_reward = reward.id < 0;

    // set the pledge value
    if (!decline_reward) amount_input.value = reward.amount;

    // change class of selected reward
    var reward_rows = document.getElementById('fundraiser-rewards').children;
    for (var i=0; i<reward_rows.length; i++) remove_class(reward_rows[i], 'active');
    var selected_reward = document.getElementById('reward_'+reward.id+'_wrapper');
    add_class(selected_reward, 'active');

    // set the hidden reward_id input
    document.getElementById('reward-id').value = (decline_reward ? '' : reward.id);

    // scroll to top if need be
    scrollTo(0,0);
  });

  define('make_pledge', function(fundraiser, form_data) {
    clear_message();

    // select reward
    // build the redirect_url, with pledge_id placeholder
    form_data.redirect_url = form_data.redirect_url || BountySource.www_host+'#fundraisers/'+fundraiser.id+'/pledges/:pledge_id/receipt';

    BountySource.make_pledge(fundraiser.id, form_data, function(response) {
      if (response.meta.success) {
        if (form_data.payment_method == 'personal') BountySource.set_cached_user_info(null);
        window.location.href = response.data.redirect_url;
      } else {
        render_message(error_message(response.data.error));
      }
    });
  });
}