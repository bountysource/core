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
            messages(),

            fieldset(
              label('Pledge Amount:'),
              span({ style: 'font-size: 30px; vertical-align: middle; padding-right: 5px;' }, '$'),
              input({ id: 'pledge-amount', style: 'width: 240px; display: inline-block;', autofocus: true, name: 'amount', placeholder: '25', value: params.amount||'' }),
              submit({ 'class': 'green', style: 'display: inline-block;' }, 'Continue to payment')
            ),

            // payment method selection
            fieldset(
              label('Payment Source:'),
              Payment.payment_methods({ style: 'vertical-align: top;' })
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
         var element = reward_row(reward);
         if (i < (fundraiser.rewards.length-1)) element.style['border-bottom'] = '2px dotted #C7C7C7';
         elements.push(element);
       }
       return elements;
     })()
    );
  });

  define('reward_row', function(reward) {
    var reward_element = div({ id: 'reward_'+reward.id+'_wrapper', style: 'min-height: 100px; padding: 15px;' },
      div({ style: 'display: inline-block; width: 400px; vertical-align: middle;' },
        span({ style: 'font-size: 25px;' }, 'Pledge ', money(reward.amount), ' +'),

        (reward.limited_to > 0) && div({ style: 'margin: 10px 0 0 10px;; font-size: 14px;' },
          div({ style: 'font-style: italic; text-decoration: '+(reward.sold_out ? 'line-through' : 'none')+';' }, 'Limited: ', formatted_number(reward.limited_to - (reward.claimed||0)), ' of ', formatted_number(reward.limited_to), ' left'),
          reward.sold_out && div({ style: 'color: #DF2525;' }, 'Sold out!')
        ),

        p({ style: 'margin-left: 10px; line-height: 20px; white-space: pre-wrap;' }, reward.description)
      ),

      div({ style: 'clear: both;' })
    );

    if (reward.sold_out) {
      add_class(reward_element, 'sold-out');
    } else {
      reward_element.addEventListener('click', curry(set_pledge_amount_from_reward, reward));
    };

    return reward_element;
  })

  define('set_pledge_amount_from_reward', function(reward, e) {
    // set pledge amount from reward if it's empty, or iff the reward min pledge amount > current pledge amount
    var amount_input = document.getElementById('pledge-amount');
    if (!amount_input) return;

    var decline_reward = reward.id < 0;

    // set the pledge value
    if (!decline_reward && (isNaN(parseInt(amount_input.value)) || parseInt(amount_input.value) < reward.amount)) {
      amount_input.value = reward.amount;
    }

    // change class of selected reward
    var reward_rows = document.getElementById('fundraiser-rewards').children;
    for (var i=0; i<reward_rows.length; i++) remove_class(reward_rows[i], 'active');
    var selected_reward = document.getElementById('reward_'+reward.id+'_wrapper');
    add_class(selected_reward, 'active');

    // set the hidden reward_id input
    document.getElementById('reward-id').value = (decline_reward ? '' : reward.id);

    amount_input.focus();
    scrollTo(0,0);
  });

  define('make_pledge', function(fundraiser, form_data) {
    clear_message();

    // if you are pledging enough money to claim a reward, prompt the user before letting them continue
    var pledge_amount       = parseInt(document.getElementById('pledge-amount').value)||null,
        selected_reward_id  = parseInt(document.getElementById('reward-id').value);

    // find the reward from reward_id hidden input value
    var selected_reward;
    for (var i=0; i<fundraiser.rewards.length; i++) {
      if (parseInt(fundraiser.rewards[i].id) == selected_reward_id) {
        selected_reward = fundraiser.rewards[i];
        break;
      }
    }

    // if no reward selected, prompt user before continuing if they have pledged enough $ to claim one.
    if (pledge_amount && (!selected_reward && pledge_amount >= fundraiser.rewards[0].amount)) {
      if (!confirm("Your pledge of "+money(pledge_amount)+" entitles you to a reward, but you haven't selected one.\n\nContinue without selecting a reward?")) return;
    }

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