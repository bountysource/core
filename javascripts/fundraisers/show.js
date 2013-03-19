with (scope('Show', 'Fundraiser')) {

  // Note: fundraiser identifier will either be just an ID, or and ID with a concatenated title string
  route('#fundraisers/:fundraiser_id', function(fundraiser_id) {
    var fundraiser_div = div('Loading...');

    render(fundraiser_div);

    BountySource.get_fundraiser(fundraiser_id, function(response) {
      if (response.meta.success) {
        var fundraiser = response.data;

        App.update_facebook_like_button({
          name:         fundraiser.title,
          caption:      fundraiser.short_description,
          description:  "BountySource is the funding platform for open-source software, contribute by making a pledge to this fundraiser!",
          picture:      fundraiser.image_url || ''
        });

        render({ into: fundraiser_div }, fundraiser_template(fundraiser));

        Facebook.process_elements();
        Twitter.process_elements();
        GooglePlus.process_elements();
      } else {
        render({ into: fundraiser_div }, error_message(response.data.error));
      }
    });
  });

  define('fundraiser_template', function(fundraiser, options) {
    options = options || {};

    var fundraiser_form = section({ id: 'fundraiser-wrapper' },
      Columns.create({ show_side: true }),

      Columns.main(
        h1({ id: 'fundraiser-title' }, fundraiser.title),

        // edit and info links
        fundraiser.owner && ul({ id: 'edit-links' },
          li(a({ href: fundraiser.frontend_edit_path+'/basic-info' }, img({ src: 'images/edit.gif' }), span('Edit'))),
          li(a({ href: fundraiser.frontend_info_path }, img({ src: 'images/info.gif' }), span('Pledges')))
        ),

        fundraiser.image_url && img({ id: 'fundraiser-image', src: fundraiser.image_url }),

        div({ id: 'short-description' }, fundraiser.short_description || ''),

        div({ id: 'fundraiser-links' },
          div(
            div('Created'),
            div(formatted_date(fundraiser.created_at), ' by ', fundraiser.person.display_name)
          ),

          fundraiser.homepage_url && div(
            div('Homepage:'),
            a({ target: '_blank', href: fundraiser.homepage_url }, fundraiser.homepage_url)
          ),

          fundraiser.repo_url && fundraiser.repo_url != fundraiser.homepage_url && div(
            div('Repository:'),
            a({ target: '_blank', href: fundraiser.repo_url }, fundraiser.repo_url)
          )
        ),

        ul({ 'class': 'fundraiser-social-buttons' },
          li(Facebook.like_button),
          li(
            Twitter.share_button({
              'data-count': 'none'
            })
          ),
          li(
            GooglePlus.like_button({
              'data-annotation': 'none'
            })
          ),
          li(
            input({
              id: 'fundraiser-embed',
              value: Fundraiser.embed_iframe(fundraiser).outerHTML,
              readonly: true,
              onClick: function() { this.select() }
            })
          )
        ),

        div({ style: 'border-bottom: 2px dotted #E4E4E4;' }),

        div({
          id: 'fundraiser-description',
          'class': 'markdown',
          html: fundraiser.description_html
        })
      ),

      Columns.side(
        // show edit button if this fundraiser belongs to the user
        options.preview && a({ 'class': 'button blue', href: Edit.hide_preview },
          div({ style: 'display: inline-block;' },
            img({ src: 'images/edit_32.gif', style: 'vertical-align: middle;' })
          ),
          div({ style: 'display: inline-block; width: 80%' }, span('Continue Editing'))
        ),

        // publish button. hidden in preview mode
        fundraiser.owner && !fundraiser.published && info_message(
          div({ style: 'text-align: center;' },
            p("You haven't published your fundraiser yet, so it isn't public."),
            p(a({ href: fundraiser.frontend_edit_path+'/basic-info' }, 'Finish editing your fundraiser'), " now to publish it!")
          )
        ),

        section({ id: 'fundraiser-stats', style: 'margin: 10px 0; border-radius: 3px;' },
          ul({ style: 'list-style-type: none; padding: 0;' },
            li({ style: 'margin: 20px auto;' },
              span({ style: 'font-size: 45px; display: inline-block;' }, fundraiser.pledges.length+''), br(), span({ style: 'margin-left: 5px; margin-top: 12px; display: inline-block;' }, 'backer' + (fundraiser.pledges.length == 1 ? '' : 's'))
            ),

            li({ style: 'margin: 20px auto;' },
              span({ style: 'font-size: 45px; display: inline-block;' }, money(fundraiser.total_pledged||0)), br(), span({ style: 'margin-left: 5px; margin-top: 12px; display: inline-block;' }, 'pledged of ', money(fundraiser.funding_goal||0), ' goal')
            ),

            fundraiser.in_progress && li({ style: 'margin: 20px auto;' },
              span({ style: 'font-size: 45px; display: inline-block;' }, fundraiser.days_remaining+''), br(), span({ style: 'margin-left: 5px; margin-top: 12px; display: inline-block;' }, 'day', (fundraiser.days_remaining == 1 ? '' : 's'), ' left')
            ),

            !fundraiser.in_progress && li({ style: 'margin: 20px auto;' },
              span({ style: 'font-size: 45px; display: inline-block;' }, 'Closed'), br(), span({ style: 'margin-left: 5px; margin-top: 12px; display: inline-block;' }, 'ended ', formatted_date(fundraiser.ends_at))
            )
          ),

          fundraiser.in_progress && form({ action: curry(Pledge.make_pledge, fundraiser.id) },
            messages(),
            a({ 'class': 'button green pledge-button', href: '#fundraisers/'+fundraiser.id+'/pledge' }, 'Make a Pledge')
          )
        ),

        (fundraiser.rewards.length > 0) && section({ id: 'fundraiser-rewards', style: 'background: #EEE; margin: 10px 0; border-radius: 3px; width: 100%;' },
          fundraiser.rewards.map(function(reward) {
            var reward_row_element = div(
              span({ style: 'font-size: 25px;' }, 'Pledge ', money(reward.amount), ' +'),

              (reward.claimed > 0) && div({ style: 'margin: 10px 0 0 10px; font-size: 14px; font-style: italic' },
                span(formatted_number(reward.claimed) + ' claimed')
              ),

              (reward.limited_to > 0) && div({ style: 'margin: 10px 0 0 10px; font-size: 14px;' },
                div({ style: 'font-style: italic; text-decoration: '+(reward.sold_out ? 'line-through' : 'none')+';' }, 'Limited: ', formatted_number(reward.limited_to - (reward.claimed||0)), ' of ', formatted_number(reward.limited_to), ' left'),
                reward.sold_out && div({ style: 'color: #DF2525;' }, 'Sold out!')
              ),

              p({ style: 'margin-left: 10px; white-space: pre-wrap;' }, reward.description)
            );

            if (reward.sold_out) {
              add_class(reward_row_element, 'sold-out');
            } else if (fundraiser.in_progress) {
              reward_row_element.addEventListener('click', curry(set_route, '#fundraisers/'+fundraiser.id+'/pledge?reward_id='+reward.id));
            }

            return reward_row_element;
          })
        )
      )
    );

    return fundraiser_form;
  });
}
