with (scope('Pledge', 'Fundraiser')) {

  route('#fundraisers/:fundraiser_id/pledge', function(fundraiser_id) {
    Pledge.errors_div = div({ style: 'width: 500px;' });

    var target_div = div('Loading...');

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
      var params      = get_params(),
          fundraiser  = response.data;

      // render the title of the fundraiser into header
      render({ target: 'breadcrumbs-fundraiser-title' }, a({ href: fundraiser.frontend_path }, truncate(fundraiser.title, 60)));

      // require the fundraiser to be published
      if (!fundraiser.published) return render({ into: target_div }, error_message('Fundraiser has not been published.'));

      render({ into: target_div },
        Columns.create({ show_side: false }),

        Columns.main(
          form({ 'class': 'fancy', action: curry(make_pledge, fundraiser) },
            fieldset({ 'class': 'no-label' },
              Pledge.errors_div
            ),

            fieldset(
              label('Pledge Amount:'),
              span({ style: 'font-size: 30px; vertical-align: middle; padding-right: 5px;' }, '$'),
              input({ id: 'pledge-amount', style: 'width: 240px; display: inline-block;', autofocus: true, name: 'amount', placeholder: '25', value: params.amount||'' })
            ),

            // payment method selection
            fieldset(
              label('Payment Source:'),
              Payment.payment_methods({ style: 'vertical-align: top;', value: params.payment_method })
            ),

            // rewards table
            fieldset(
              input({ id: 'reward-id', type: 'hidden', name: 'reward_id' }),

              label('Select Reward:'),
              div({ id: 'fundraiser-rewards', style: 'vertical-align: top; width: 500px;' },
                // No Reward option
                reward_row({
                  id: 0,
                  description: "No reward please, I just want to help out!"
                }),

                // populate the table with the actual rewards
                fundraiser.rewards.map(function(reward) {
                  return reward_row(reward);
                })
              )
            )
          )
        )
      );

      // if a reward id was passed in, select it now
      if (params.reward_id) {
        var e = document.getElementById('reward_'+params.reward_id+'_wrapper');
        if (e) e.click();
      }

      // if there are no rewards, automatically select the "No reward" options, which is always present.
      if (fundraiser.rewards.length <= 0) document.getElementById('fundraiser-rewards').children[0].click();
    });
  });

  define('reward_row', function(reward) {
    var reward_radio = radio({ id: 'reward_'+reward.id+'_radio', name: 'reward_id_radio', style: 'vertical-align: middle;' });
    var submit_button = div({ 'class': 'reward-submit-button', style: 'display: none; margin-top: 10px; text-align: center; padding-top: 10px; margin-top: 10px; border-top: 1px solid #AFECAF' },
      submit({ 'class': 'button blue' }, logged_in() ? "Continue to Payment" : "Sign In and Pay")
    );
    if (reward.sold_out) reward_radio.setAttribute('disabled', true);

    // if the id is set to 0, this is the "No Reward" row
    var no_reward = (reward.id == 0);

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
      reward_element.addEventListener('click', function() {
        // uncheck all radios
        var elements = document.getElementsByName('reward_id_radio');
        for (var i=0; i<elements.length; i++) elements[i].removeAttribute('checked');

        // check this radio
        reward_radio.setAttribute('checked','checked');

        // hide all submit buttons
        var elements = document.getElementsByClassName('reward-submit-button');
        for (var i=0; i<elements.length; i++) hide(elements[i]);

        // show this submit button
        show(submit_button);

        // set the pledge input with reward value if needed
        if (!has_class(this, 'active')) set_pledge_amount_from_reward(reward);
      });
    };

    return reward_element;
  });

  define('set_pledge_amount_from_reward', function(reward) {
    // set pledge amount from reward if it's empty, or iff the reward min pledge amount > current pledge amount
    var amount_input = document.getElementById('pledge-amount');
    if (!amount_input) return;

    var decline_reward = (reward.id == 0);

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
    document.getElementById('reward-id').value = reward.id;
  });

  route('#fundraisers/:fundraiser_id/pledges/:pledge_id', function(fundraiser_id, pledge_id) {
    // if the pledge ID was not subbed into the URL, just go view the issue.
    // This will happen on Paypal cancel.
    if (/:pledge_id/.test(pledge_id)) return set_route('#fundraisers/'+fundraiser_id);

    var target_div = div('Loading...');

    render(target_div);

    BountySource.get_pledge(pledge_id, function(response) {
      if (response.meta.success) {
        var pledge      = response.data,
            fundraiser  = pledge.fundraiser,
            reward      = pledge.reward;

        Pledge.errors = div();

        render({ into: target_div },
          breadcrumbs(
            a({ href: '#' }, 'Home'),
            a({ href: fundraiser.frontend_path }, truncate(fundraiser.title, 100)),
            a({ href: '#contributions' }, 'Pledges'),
            a({ href: pledge.frontend_path }, money(pledge.amount))
          ),

          Columns.create({ show_side: true }),

          Columns.side(
            div({ style: 'text-align: center;' },
              Fundraiser.card(pledge.fundraiser)
            )
          )
        );

        if (pledge.reward && pledge.reward.fulfillment_details && !pledge.survey_response) {
          Columns.main(
            info_message("In order to receive the reward you selected, please complete the following survey from the fundraiser creator:"),

            Pledge.errors,

            form({ 'class': 'fancy', action: curry(update_pledge, pledge) },
              fieldset(
                label("Question:"),
                div({ style: 'display: inline-block; vertical-align: middle; text-align: left; width: 450px;' }, reward.fulfillment_details)
              ),

              fieldset(
                label('Response:'),
                textarea({ required: true, name: 'survey_response', style: 'height: 100px; width: 300px;' }, pledge.survey_response || '')
              ),

              fieldset({ 'class': 'no-label' },
                button({ 'class': 'button green', style: 'width: 200px;' }, 'Answer Survey')
              )
            )
          );
        } else {
          Columns.main(
            div({ style: 'text-align: center;' },
              h2(money(pledge.amount), " Pledge Made"),

              pledge.reward && div({ style: 'margin: 10px; 0' },
                h4({ style: 'margin-bottom: 0;' }, 'Reward:'),
                p({ style: 'margin: 0 200px; padding: 10px;' }, pledge.reward.description),

                pledge.reward.fulfillment_details && pledge.survey_response && [
                  h4({ style: 'margin-bottom: 0;' }, 'Reward Question:'),
                  p({ style: 'margin: 0 200px; padding: 10px;' }, pledge.reward.fulfillment_details),

                  h4({ style: 'margin-bottom: 0;' }, 'Your Response:'),
                  p({ style: 'margin: 0 200px; padding: 10px;' }, pledge.survey_response)
                ]
              ),

              div(
                Facebook.create_share_button({
                  link:         pledge.fundraiser.frontend_url,
                  name:         "I just backed "+pledge.fundraiser.title,
                  caption:      pledge.fundraiser.short_description,
                  description:  "Bountysource is the funding platform for open-source software, contribute by making a pledge to this fundraiser!",
                  picture:      pledge.fundraiser.image_url || ''
                }, a({ 'class': 'btn-auth btn-facebook large', style: 'margin-right: 10px;' }, 'Share')),

                Twitter.create_share_button({
                  url:  pledge.fundraiser.frontend_url,
                  text: money(pledge.amount)+" pledge made to "+pledge.fundraiser.title,
                  via:  'Bountysource'
                }, a({ 'class': 'btn-auth btn-twitter large', style: 'margin-right: 10px;' }, 'Tweet'))
              )
            )
          )
        }
      } else {
        render({ into: target_div }, error_message(response.data.error));
      }
    });
  });

  define('update_pledge', function(pledge, form_data) {
    render({ into: Pledge.errors }, '');

    BountySource.update_pledge(pledge.id, form_data, function(response) {

      console.log(response);

      if (response.meta.success) {
        set_route(pledge.frontend_path);
      } else {
        render({ into: Pledge.errors }, error_message(response.data.error));
      }
    });
  });

  define('make_pledge', function(fundraiser, form_data) {
    if (isNaN(parseInt(form_data.reward_id))) {
      return render_message(error_message('Please select your reward first'));
    }

    var payment_data = {
      amount:  form_data.amount,
      payment_method: form_data.payment_method,
      item_number: 'fundraisers/' + fundraiser.id + (parseInt(form_data.reward_id) > 0 ? '/'+form_data.reward_id : ''),
      success_url: window.location.href.split('#')[0] + '#fundraisers/'+fundraiser.id+'/pledges/:item_id/receipt',
      cancel_url: window.location.href.split('#')[0] + fundraiser.frontend_path,
      postauth_url: window.location.href.split('#')[0] + '#fundraisers/'+fundraiser.id+'/pledge?payment_method='+form_data.payment_method+'&amount='+form_data.amount+'&reward_id='+form_data.reward_id
    };

    BountySource.make_payment(payment_data, function(errors) {
      render({ into: Pledge.errors_div }, error_message(errors));
    });
  });
}