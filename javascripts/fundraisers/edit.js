with (scope('Edit', 'Fundraiser')) {

  define('loading', function() {
    return div({ style: 'text-align: center;' },
      img({ src: 'images/spinner.gif' }),
      div({ style: 'font-style: italic;' }, 'Loading...')
    );
  });

  define('update_fundraiser_then_set_route', function(route) {
    set_route(route);
  });

  define('is_blank', function(attr) {
    if (typeof(attr) == 'number' && attr == 0) return false;
    if (!attr) return true;
    if (typeof(attr) == 'object') return Object.keys(attr).length <= 0;
    return attr.toString().length <= 0;
  });

  define('not_blank', function(attr) { return !is_blank(attr); });

  define('nav_bar', function(fundraiser) {
    // TODO something for 'Next' button functionality
    Edit.links = { next: null, previous: null };

    // determine which sections have been completed
    var section_completed = {
      basic_info:   not_blank(fundraiser.title) && not_blank(fundraiser.short_description),
      description:  not_blank(fundraiser.description_html),
      funding:      not_blank(fundraiser.funding_goal) && (fundraiser.funding_goal > 0),
      rewards:      fundraiser.rewards.length > 0,
      duration:     not_blank(fundraiser.days_open)
    };

    var nav_bar_ul = ul({ id: 'fundraiser-nav-bar', 'class': 'fundraiser-nav', style: 'margin-bottom: 10px;' },
      li(
        a({
          id:       'basic-info',
          'class':  (section_completed.basic_info ? 'complete': 'warning'),
          href:     curry(update_fundraiser_then_set_route, fundraiser.frontend_edit_path+'/basic-info') },

          div({ 'class': 'label' },
            span('Basic Info'),
            section_completed.basic_info ? img({ src: 'images/icon-check-16.png' }) : img({ src: 'images/alert.gif' })
          )
        )
      ),
      li(
        a({
          id:       'description',
          'class':  (section_completed.description ? 'complete' : 'warning'),
          href:     curry(update_fundraiser_then_set_route, fundraiser.frontend_edit_path+'/description') },

          div({ 'class': 'label' },
            span('Description'),
            section_completed.description ? img({ src: 'images/icon-check-16.png' }) : img({ src: 'images/alert.gif' })
          )
        )
      ),
      li(
        a({
          id:       'rewards',
          'class':  section_completed.rewards ? 'complete' : 'warning',
          href:     curry(update_fundraiser_then_set_route, fundraiser.frontend_edit_path+'/rewards') },

          div({ 'class': 'label' },
            span('Rewards'),
            section_completed.rewards ? img({ src: 'images/icon-check-16.png' }) : img({ src: 'images/alert.gif' })
          )
        )
      ),

      li(
        a({
          id:       'funding',
          'class':  (fundraiser.published ? 'locked' : (section_completed.funding ? 'complete' : 'warning')),
          href:     curry(update_fundraiser_then_set_route, fundraiser.frontend_edit_path+'/funding') },

          div({ 'class': 'label' },
            span('Funding'),
            fundraiser.published ? img({ src: 'images/locked.gif' }) : (section_completed.funding ? img({ src: 'images/icon-check-16.png' }) : img({ src: 'images/alert.gif' }))
          )
        )
      ),

      li(
        a({
          id:       'duration',
          'class':  (fundraiser.published ? 'locked' : (section_completed.duration ? 'complete' : 'warning')),
          href:     curry(update_fundraiser_then_set_route, fundraiser.frontend_edit_path+'/duration') },

          div({ 'class': 'label' },
            span('Duration'),
            fundraiser.published ? img({ src: 'images/locked.gif' }) : (section_completed.duration ? img({ src: 'images/icon-check-16.png' }) : img({ src: 'images/alert.gif' }))
          )
        )
      )
    );

    // make an li active based on route
    var nav_bar_links = nav_bar_ul.getElementsByTagName('a');
    for (var i=0; i<nav_bar_links.length; i++) {
      if (get_route() == fundraiser.frontend_edit_path+'/'+nav_bar_links[i].id) add_class(nav_bar_links[i], 'active');
    }

    return nav_bar_ul;
  });

  define('publish_button', function(fundraiser) {
    var publish_button_content = div({ id: 'publish-button', style: 'background: #F7F7F7;' });

    if (fundraiser.publishable) {
      render({ into: publish_button_content },
        a({ 'class': 'button blue', href: curry(publish_fundraiser, fundraiser) }, 'Publish')
      );
    } else {
      render({ into: publish_button_content },
        info_message("You need to provide all of the necessary data to publish your fundraiser."),
        div({ 'class': 'button gray', style: 'text-decoration: none;' }, 'Publish Fundraiser')
      );
    }

    return publish_button_content;
  });

  define('with_fundraiser_edit_layout', function(fundraiser_id, section, yield) {
    Edit.errors_div = div();
    var target_div = div(loading);

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#account' }, 'Account'),
        a({ href: '#account/fundraisers' }, 'Fundraisers'),
        span({ id: 'fundraiser-title' }, 'Loading...'),
        section
      ),
      target_div
    );

    BountySource.get_fundraiser(fundraiser_id, function(response) {
      if (response.meta.success) {
        var fundraiser = response.data;

        // initialize cached fundraiser
        Edit.cached_fundraiser = fundraiser;

        // render the title into the breadcrumbs
        render({ target: 'fundraiser-title' }, a({ href: fundraiser.frontend_path }, fundraiser.title));

        // render everything else
        render({ into: target_div },
          curry(nav_bar, fundraiser),

          div({ id: 'fundraiser-preview-wrapper', style: 'display: none;' },
            div({ id: 'fundraiser-preview' }, Show.fundraiser_template(fundraiser, { preview: true }))
          ),

          div({ id: 'fundraiser-edit-form-wrapper' },
            Edit.errors_div,

            Columns.create({ show_side: true }),

            Columns.main(
              yield(fundraiser)
            ),

            Columns.side(
              div({ style: 'box-shadow: 0 0 10px #DADADA; border: 1px solid #CCC; border-radius: 3px;' },
                div({ style: 'background: #F7F7F7; border-bottom: 1px solid #CCC; padding: 10px;' },
                  h4({ style: 'margin: 0 0 5px 0;' }, 'Card Preview'),
                  div({ style: 'font-size: 12px' }, "Home page card preview. Click to preview full fundraiser page:")
                ),

                div({ style: 'padding: 10px; border-bottom: 1px solid #CCC;' },
                  // this is re-rendered after each save
                  div({ id: 'fundraiser-card-preview' }, Fundraiser.card(fundraiser, { href: show_preview }))
                ),

                !fundraiser.published && div({ style: 'padding: 10px;' }, curry(publish_button, fundraiser))
              )
            )
          )
        );

        // initialize auto save on input blur
        var input_groups = [
          document.getElementsByTagName('input'),
          document.getElementsByTagName('textarea'),
          document.getElementsByTagName('select')
        ];
        for (var i=0; i<input_groups.length; i++) {
          for (var j=0; j<input_groups[i].length; j++) {
            if (input_groups[i][j].getAttribute('data-autosave')) {
              input_groups[i][j].addEventListener('blur', function() {
                var data = {};
                data[this.name] = this.value;
                if (this.value != Edit.cached_fundraiser[this.name]) update_fundraiser(fundraiser, data);
              });
            }
          }
        }
      } else {
        render({ into: target_div }, error_message(response.data.error));
      }
    });
  });

  route('#fundraisers/:fundraiser_id/edit/basic-info', function(fundraiser_id) {
    with_fundraiser_edit_layout(fundraiser_id, 'Basic Info', function(fundraiser) {
      return form({ 'class': 'fancy', id: 'fundraiser-edit-form', action: curry(update_fundraiser, fundraiser) },
        fundraiser_block({ id: 'basic-info', title: 'Basic Information', description: "Provide some basic information about your proposal." },
          fieldset(
            label('Title:'),
            input({ 'data-autosave': true, name: 'title', 'class': 'long', placeholder: 'My OSS Project', value: fundraiser.title||'' })
          ),
          fieldset(
            label('Banner Image:'),
            input({ 'data-autosave': true, name: 'image_url', 'class': 'long', placeholder: 'http://i.imgur.com/abc123', value: fundraiser.image_url||'' })
          ),
          fieldset(
            label('Project Homepage:'),
            input({ 'data-autosave': true, name: 'homepage_url', 'class': 'long', placeholder: 'https://www.bountysource.com', value: fundraiser.homepage_url||'' })
          ),
          fieldset(
            label('Source Repository:'),
            input({ 'data-autosave': true, name: 'repo_url', 'class': 'long', placeholder: 'https://github.com/badger/frontend', value: fundraiser.repo_url||'' })
          ),
          fieldset(
            label('Short Description:'),
            textarea({ 'data-autosave': true, id: 'short-description', name: 'short_description', style: 'width: 392px; height: 150px; line-height: 18px;', placeholder: "Brief description of your fundraiser. Must be 140 characters or less." }, fundraiser.short_description || '')
          )
        )
      );
    });
  });

  route('#fundraisers/:fundraiser_id/edit/description', function(fundraiser_id) {
    with_fundraiser_edit_layout(fundraiser_id, 'Description', function(fundraiser) {
      var description_textarea = textarea({ 'data-autosave': true, name: 'description', style: 'width: 615px; height: 600px; line-height: 18px;', placeholder: "Very thorough description of your fundraiser proposal." },
        fundraiser.description || ''
      );

      // long poll saving for description
      Edit.update_needed = false;
      description_textarea.addEventListener('keydown', function() { Edit.update_needed = true });
      setInterval(function() {
        if (Edit.update_needed) {
          update_fundraiser(fundraiser, { description: description_textarea.value });
          Edit.update_needed = false;
        }
      }, 3000);

      return form({ 'class': 'fancy', id: 'fundraiser-edit-form', action: curry(update_fundraiser, fundraiser) },
        fundraiser_block({ id: 'description', title: 'Description', description: div("Convince people to contribute. Why is your project interesting and worthy of funding? Formatted with ", a({ target: '_blank', href: 'http://github.github.com/github-flavored-markdown/' }, "GitHub Flavored Markdown.")) },
          description_textarea
        )
      );
    });
  });

  route('#fundraisers/:fundraiser_id/edit/rewards', function(fundraiser_id) {
    with_fundraiser_edit_layout(fundraiser_id, 'Rewards', function(fundraiser) {
      Edit.rewards = fundraiser.rewards;

      return fundraiser_block({ id: 'rewards', title: 'Rewards', description: "Thank your backers." },
        div({ id: 'rewards' },

          div({ id: 'reward-rows' }, fundraiser.rewards.map(function(reward) { return reward_row(fundraiser, reward) })),

          br,

          div({ id: 'create-reward-errors' }),

          form({ 'class': 'fancy', id: 'rewards-create', action: curry(create_reward, fundraiser) },
            fieldset(
              label({ 'for': 'amount' }, 'Amount & Quantity:'),
              number({ name: 'amount', required: true, min: 0, placeholder: '$10' }),
              number({ name: 'limited_to', min: 0, placeholder: 'Unlimited' })
            ),

            fieldset(
              label({ 'for': 'description' }, 'Description:'),
              textarea({ name: 'description', required: true, placeholder: 'What sort of awesome goodies do you want your backers to have?' })
            ),

            fieldset(
              label({ 'for': 'description' }, 'Fulfillment Details:'),
              textarea({ name: 'fulfillment_details', placeholder: 'Request additional information from backers to fulfill this reward. For example, you may need to ask for a shirt size, mailing address, etc.' })
            ),

            fieldset({ 'class': 'no-label' }, submit({ 'class': 'button green' }, 'Create Reward'))
          )
        )
      );
    });
  });

  route('#fundraisers/:fundraiser_id/edit/funding', function(fundraiser_id) {
    with_fundraiser_edit_layout(fundraiser_id, 'Funding', function(fundraiser) {
      var payout_method_select = select({ 'data-autosave': true, required: true, name: 'payout_method', style: 'width: 400px;' },
        option(),
        option({ value: 'on_funding' },   'All upon funding goal being reached.'),
        option({ value: 'fifty_fifty' },  'Half on funding goal being reached, half after delivery.'),
        option({ value: 'on_delivery' },  'All upon delivery.')
      );

      if (fundraiser.payout_method) payout_method_select.value = fundraiser.payout_method;

      if (fundraiser.published) payout_method_select.setAttribute('disabled', true);

      return form({ 'class': 'fancy', id: 'fundraiser-edit-form', action: curry(update_fundraiser, fundraiser) },
        fundraiser_block({ id: 'funding-details', title: 'Funding Details', description: "How much funding do you need to complete this project? How do you want to receive the funds?" },
          fieldset(
            label('Funding Goal:'),
            fundraiser.published ? [
              span({ style: 'vertical-align: middle; font-size: 25px;' }, money(fundraiser.funding_goal))
            ] : [
              span({ style: 'font-size: 30px; vertical-align: middle; padding-right: 5px;' }, '$'),
              number({ 'data-autosave': true, name: 'funding_goal', min: 1, placeholder: '50,000', value: fundraiser.funding_goal })
            ]
          )
        )
      );
    });
  });

  route('#fundraisers/:fundraiser_id/edit/duration', function(fundraiser_id) {
    with_fundraiser_edit_layout(fundraiser_id, 'Duration', function(fundraiser) {
      var days_open_input = number({
        'data-autosave': true,
        name:         'days_open',
        style:        'width: 50px;',
        placeholder:  fundraiser.min_days_open,
        value:        fundraiser.days_open || fundraiser.min_days_open,
        min:          fundraiser.min_days_open,
        max:          fundraiser.max_days_open
      });

      var end_by_date = new Date((new Date()).getTime() + 1000*60*60*24*parseInt(days_open_input.value));
      var end_by_date_element = span(formatted_date(end_by_date));

      days_open_input.addEventListener('change', function(e) {
        var end_by_date = new Date((new Date()).getTime() + 1000*60*60*24*parseInt(e.target.value));
        render({ into: end_by_date_element }, formatted_date(end_by_date));
      });

      return form({ 'class': 'fancy', id: 'fundraiser-edit-form', action: curry(update_fundraiser, fundraiser) },
        fundraiser_block({ id: 'duration', title: 'Duration', description: ("How long would you like your fundraiser to run? It can run between "+fundraiser.min_days_open+" and "+fundraiser.max_days_open+" days.") },
          fieldset(
            label('Days Open:'),
            fundraiser.published ? span({ style: 'vertical-align: middle; font-size: 25px;' }, formatted_number(fundraiser.days_open)) : days_open_input
          ),

          fieldset(
            label('End Date:'),
            end_by_date_element
          )
        )
      );
    });
  });

  // a pretty, formatted container for a set of inputs.
  // ARGUMENTS: options, *yield
  // yield                - what you want inside of the block
  // options.title        - the title of the block
  // options.description  - description of the inputs in the block
  define('fundraiser_block', function() {
    var arguments = flatten_to_array(arguments);
    var options   = shift_options_from_args(arguments);
    options['class'] = 'fundraiser-block';
    options['style'] = options['style'] || 'box-shadow: 0 0 10px #DADADA; border: 1px solid #CCC; border-radius: 3px;';

    return div(options,
      div({ style: 'background: #F7F7F7; border-radius: 3px 3px 0 0; border-bottom: 1px solid #CCC' },
        div({ style: 'display: inline-block; padding: 20px 10px; vertical-align: middle; border-radius: 3px 3px 0 0;' },
          span({ style: 'font-size: 25px;' }, options.title),
          div({ style: 'margin-left: 15px; padding-top: 10px; color: gray;' }, options.description)
        )
      ),
      div({ style: 'background: #eee; padding: 20px 10px; border-radius: 0 0 3px 3px;' },
        arguments
      )
    );
  });

  define('reward_row', function(fundraiser, reward) {
    var reward_row_element = div({ id: 'reward-row-'+reward.id, 'class': 'reward-row', 'data-amount': (reward.amount||0) },

      div({ id: 'reward-row-'+reward.id+'-info' }, reward_info(reward)),

      div({ id: 'reward-row-'+reward.id+'-errors' }),

      form({ 'class': 'fancy', action: curry(update_reward, fundraiser, reward) },
        fieldset(
          label({ 'for': 'amount' }, 'Amount & Quantity:'),

          fundraiser.published ? [
            span({ style: 'font-size: 20px; margin-right: 15px; vertical-align: middle;' }, money(reward.amount))
          ] : [
            number({ name: 'amount', required: true, min: 0, placeholder: '$10', value: reward.amount||'' })
          ],

          number({ name: 'limited_to', min: 0, placeholder: 'Unlimited', value: reward.limited_to||'' })
        ),

        fieldset(
          label({ 'for': 'description' }, 'Description:'),

          fundraiser.published ? [
            div({ style: 'display: inline-block; width: 400px; vertical-align: top;' }, reward.description)
          ] : [
            textarea({ name: 'description', required: true, placeholder: 'What sort of awesome goodies do you want your backers to have?' }, reward.description||'')
          ]
        ),

        fieldset(
          label({ 'for': 'description' }, 'Fulfillment Details:'),
          textarea({ name: 'fulfillment_details', placeholder: 'Request additional information from backers to fulfill this reward. For example, you may need to ask for a shirt size, mailing address, etc.' }, reward.fulfillment_details||'')
        ),

        fieldset({ 'class': 'no-label edit-reward-buttons' },
          submit({ 'class': 'button green' }, 'Save'),
          a({ 'class': 'button blue', style: 'width: 100px;', href: curry(cancel_reward_update, reward) }, 'Cancel'),
          !fundraiser.published && a({ 'class': 'button blue', style: 'width: 100px;',href: curry(destroy_reward, fundraiser, reward) }, 'Delete')
        )
      )
    );

    reward_row_element.addEventListener('click', function() { add_class(this, 'active') });
    if (fundraiser.published) add_class(reward_row_element, 'published');

    return reward_row_element;
  });

  define('reward_info', function(reward) {
    return ul(
      li(money(reward.amount||0)),
      li(reward.limited_to ? span('(', formatted_number(reward.claimed), ' of ', formatted_number(reward.limited_to), ' left)') : 'Unlimited'),
      li(truncate(reward.description, 60))
    )
  });

  // inserts reward row in order based on amount
  define('insert_reward_row', function(fundraiser, reward) {
    // append the new reward row
    document.getElementById('reward-rows').appendChild(reward_row(fundraiser, reward));

    var reward_rows = [],
        reward_row_elements = document.getElementById('reward-rows').children;
    for (var i=0; i<reward_row_elements.length; i++) reward_rows.push(reward_row_elements[i]);

    // sort the reward rows in place
    var sort_method = function(row1, row2) {
      var val1 = parseInt(row1.getAttribute('data-amount')||'0'),
        val2 = parseInt(row2.getAttribute('data-amount')||'0');
      return val1 == val2 ? 0 : val1 > val2;
    };
    reward_rows.sort(sort_method);

    // move the elements in the DOM
    for (var i=0; i<reward_rows.length; i++) reward_rows[i].parentNode.appendChild(reward_rows[i]);
  });

  define('cancel_reward_update', function(reward) {
    var reward_row = document.getElementById('reward-row-'+reward.id);
    remove_class(reward_row, 'active')
  });

  define('update_reward', function(fundraiser, reward, data) {
    render({ target: 'reward-row-'+reward.id+'-errors' },'');

    BountySource.update_reward(fundraiser.id, reward.id, data, function(response) {
      if (response.meta.success) {
        remove_class(document.getElementById('reward-row-'+reward.id), 'active');
        render({ target: 'reward-row-'+response.data.id+'-info' }, reward_info(response.data));
      } else {
        render({ target: 'reward-row-'+reward.id+'-errors' }, small_error_message(response.data.error));
      }
    });
  });

  define('create_reward', function(fundraiser, data) {
    render({ target: 'create-reward-errors' },'');

    BountySource.create_reward(fundraiser.id, data, function(response) {
      if (response.meta.success) {
        insert_reward_row(fundraiser, response.data);
        document.getElementById('rewards-create').reset();
      } else {
        render({ target: 'create-reward-errors' }, small_error_message(response.data.error));
      }
    })
  });

  define('destroy_reward', function(fundraiser, reward) {
    render({ target: 'reward-row-'+reward.id+'-errors' }, '');

    BountySource.destroy_reward(fundraiser.id, reward.id, function(response) {
      if (response.meta.success) {
        // remove the reward row
        var reward_row = document.getElementById('reward-row-'+reward.id);
        reward_row.parentElement.removeChild(reward_row);
      } else {
        render({ target: 'reward-row-'+reward.id+'-errors' }, small_error_message(response.data.error));
      }
    });
  });

  define('update_fundraiser', function(fundraiser, data) {
    BountySource.update_fundraiser(fundraiser.id, data, function(response) {
      if (response.meta.success) {
        var fundraiser = response.data;

        // update the cached fundraiser
        Edit.cached_fundraiser = fundraiser;

        // render card preview again
        render({ target: 'fundraiser-card-preview' }, Fundraiser.card(fundraiser, { href: show_preview }));

        // render nav again
        render({ target: 'fundraiser-nav-bar' }, nav_bar(fundraiser));

        // render publish button again
        if (!fundraiser.published) render({ target: 'publish-button' }, publish_button(fundraiser));

        // render the preview again
        render({ target: 'fundraiser-preview' }, Show.fundraiser_template(fundraiser, { preview: true }));
      } else {
        Edit.cached_fundraiser = {};
        render({ into: Edit.errors_div }, error_message(response.data.error));
      }
    })
  });

  define('publish_fundraiser', function(fundraiser) {
    if (confirm('Are you sure? Once published, you cannot change the funding goal or duration.')) {
      // Fake a page view for Analytics
      _gaq.push([fundraiser.frontend_edit_path + '/publish']);
      BountySource.publish_fundraiser(fundraiser.id, function(response) {
        if (response.meta.success) {
          set_route('#account/fundraisers');
        } else {
          render({ into: Edit.errors_div }, small_error_message(response.data.error));
        }
      });
    }
  });

  // show the preview fundraiser
  define('show_preview', function() {
    hide('fundraiser-edit-form-wrapper');
    show('fundraiser-preview-wrapper');
  });

  define('hide_preview', function() {
    show('fundraiser-edit-form-wrapper');
    hide('fundraiser-preview-wrapper');
  });

  define('destroy_fundraiser', function(fundraiser_id) {
    if (confirm('Are you sure? It will be gone forever!')) {
      BountySource.destroy_fundraiser(fundraiser_id, function(response) {
        if (response.meta.success) {
          window.location.reload();
        } else {
          render({ into: Edit.errors_div }, error_message(response.data.error));
        }
      });
    }
  });
}
