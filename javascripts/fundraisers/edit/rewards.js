with (scope('Fundraisers')) {
  // generate a random ID
  define('generate_reward_row_id', function() { return 'reward-table-row_'+Math.ceil((new Date()).getTime() * Math.random()) });

  // return a row, with the correct id (based on the number of added milestones)
  define('reward_row_elements', function(reward_row_id, reward_data) {
    return [{ id: reward_row_id, 'class': 'editable' },
      td(
        div({ style: 'display: inline-block; width: 250px; margin-left: 10px;' },
          form(
            fieldset(
              label('Amount:'),
              span({ id: 'amount' }, money(reward_data.amount))
            ),
            fieldset(
              label('Quantity:'),
              span({ id: 'limited_to' }, formatted_number(reward_data.limited_to))
            )
          )
        ),
        div({ id: 'description-wrapper' },
          span({ id: 'description', style: 'white-space: pre-wrap; color: #aaa;' }, reward_data.description)
        )
      ),
      td({ style: 'text-align: center; width: 100px;' },
        a({ href: curry(unlock_reward_row, reward_row_id) }, img({ style: 'margin: 0 3px;', src: 'images/edit.gif' })),
        a({ href: curry(delete_reward_row, reward_row_id) }, img({ style: 'margin: 0 3px;', src: 'images/trash.gif' }))
      )
    ];
  });

  define('unlock_reward_row', function(reward_row_id) {
    var t           = Teddy.snuggle('rewards-table'),
      spans         = t.at(reward_row_id).getElementsByTagName('span'),
      amount        = parseInt((spans[0].innerText).match(/\$(\d+)/)[1]),
      limited_to    = parseInt(spans[1].innerText),
      description   = spans[2].innerText;

    t.at(reward_row_id).replace({ id: reward_row_id, 'class': 'editable', style: 'height: 230px;' },
      td(
        div({ style: 'display: inline-block; vertical-align: middle' },
          fieldset(
            label('Amount:'),
            span({ style: 'font-size: 25px; padding-right: 5px; vertical-align: middle;' }, '$'),
            input({ id: 'reward-input-amount', style: 'width: 100px;', placeholder: 100, value: amount })
          ),

          fieldset(
            label('Quantity:'),
            input({
              id: 'reward-input-quantity',
              placeholder: 10,
              style: 'width: 100px; margin-left: 18px;',
              value: limited_to
            })
          )
        ),

        textarea({
          id:           'reward-input-description',
          style:        'margin-left: 10px; display: inline-block;',
          placeholder:  'Description of the reward'
        }, description)
      ),

      td({ style: 'width: 100px; text-align: center;' },
        a({ href: curry(lock_reward_row, reward_row_id) }, img({ src: 'images/save.gif' }))
      )
    ).setAttribute('locked-for-edit', true);
  });

  define('lock_reward_row', function(reward_row_id) {
    var t           = Teddy.snuggle('rewards-table'),
      inputs_row  = t.at(reward_row_id);

    var reward_data = {
      description:  inputs_row.getElementsByTagName('textarea')[0].value,
      amount:       parseInt(inputs_row.getElementsByTagName('input')[0].value),
      limited_to:   parseInt(inputs_row.getElementsByTagName('input')[1].value)
    };

    inputs_row.replace(reward_row_elements(reward_row_id, reward_data));
    inputs_row.removeAttribute('locked-for-edit');
  });

  define('delete_reward_row', function(reward_row_id) {
    var t = Teddy.snuggle('rewards-table');
    t.at(reward_row_id).remove();
  });

  define('push_reward_row_from_inputs', function() {
    clear_message();

    var inputs_row  = Teddy.snuggle('rewards-table').at('reward-inputs');
    var reward_data = {
      description:  inputs_row.getElementsByTagName('textarea')[0].value,
      amount:       parseInt(inputs_row.getElementsByTagName('input')[0].value),
      limited_to:     parseInt(inputs_row.getElementsByTagName('input')[1].value)
    };

    if (!reward_data.description || reward_data.description.length <= 0) {
      render_message(small_error_message("You must provide a description."));
    } else if (!reward_data.amount || isNaN(reward_data.amount)) {
      render_message(small_error_message("Amount is invalid."));
    } else if (parseInt(reward_data.amount) <= 0) {
      render_message(small_error_message("Amount must be $1 or more."))
    } else if ((reward_data.limited_to && !isNaN(reward_data.limited_to))) {
      if (isNaN(reward_data.limited_to)) {
        render_message(small_error_message("Quantity is invalid."));
      } else if (parseInt(reward_data.limited_to) <= 0) {
        render_message(small_error_message("If specifying a quantity, must be 1 or more."));
      }

    } else {
      var t = Teddy.snuggle('rewards-table');
      t.at('reward-inputs').insert(reward_row_elements(generate_reward_row_id(), reward_data));

      // clear inputs
      document.getElementById('reward-input-description').value='';
      document.getElementById('reward-input-amount').value='';
      document.getElementById('reward-input-quantity').value='';

      //focus on the amount input after appending row
      document.getElementById('reward-input-amount').focus();
    }
  });

  // sort method to use with Rewards
  define('sort_rewards', function(a, b) {
    return (a.amount < b.amount) ? -1 : ((a.amount == b.amount) ? 0 : 1);
  });
}