with (scope('Show', 'Fundraiser')) {

  // Note: fundraiser identifier will either be just an ID, or and ID with a concatenated title string
  route('#fundraisers/:fundraiser_id', function(fundraiser_id) {
    var fundraiser_div = div('Loading...');
    var target_div = div(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'Fundraisers',
        span({ id: 'breadcrumbs-fundraiser-title' }, 'Loading...')
      ),
      fundraiser_div
    );

    render(target_div);

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
      } else {
        render({ target: 'breadcrumbs-fundraiser-title' }, 'Oh no!');
        render({ into: fundraiser_div }, error_message(response.data.error2));
      }
    });
  });

  define('fundraiser_template', function(fundraiser, options) {
    options = options || {};

    // add the title to the already present header element
    if (!options.preview) render({ target: 'breadcrumbs-fundraiser-title' }, abbreviated_text(fundraiser.title, 85));

    var fundraiser_form = section({ id: 'fundraiser-wrapper' },
      div({ 'class': 'split-main' },
        section({ id: 'fundraiser-head', style: 'border-bottom: 2px dotted #C7C7C7; padding-bottom: 10px; text-align: center; color: #5e5f5f;' },
          h1({ style: 'font-size: 45px; font-weight: normal; margin: 10px 0; line-height: 50px;' }, fundraiser.title)
        ),

        fundraiser.image_url && section({ id: 'fundraiser-image', style: 'text-align: center;' },
          img({ style: 'max-width: 630px; padding: 20px;', src: fundraiser.image_url })
        ),

        section({ id: 'fundraiser-short-description', style: 'border-bottom: 2px dotted #C7C7C7; color: #5E5F5F;' },
          div({ style: 'margin: 10px 0 25px 0; padding: 20px; background: #EEE; border-radius: 3px; font-size: 20px; line-height: 25px;' }, fundraiser.short_description||''),

          div({ id: 'fundraiser-links', style: 'margin-left: 20px; font-size: 14px;' },
            span({ style: 'display: block; margin: 10px 0;' }, 'Created ', formatted_date(fundraiser.created_at), ' by ', a({ href: fundraiser.person.profile_url }, fundraiser.person.display_name)),
            fundraiser.homepage_url &&  span({ style: 'display: block; margin: 10px 0;' }, 'Homepage: ',  a({ target: '_blank', href: fundraiser.homepage_url, style: 'color: inherit;' }, fundraiser.homepage_url)),
            (fundraiser.repo_url && fundraiser.repo_url != fundraiser.homepage_url) && span({ style: 'display: block; margin: 10px 0;' }, 'Repository: ', a({ target: '_blank', href: fundraiser.repo_url, style: 'color: inherit;' }, fundraiser.repo_url))
          )
        ),

        section({ id: 'fundraiser-description' },
          div({ 'class': 'markdown', html: fundraiser.description_html, style: 'margin: 0; padding: 10px; overflow-x: auto;' })
        )
      ),

      div({ 'class': 'split-side' },
        // show edit button if this fundraiser belongs to the user
        options.preview ? a({ 'class': 'blue', href: Edit.hide_preview, style: 'padding: 10px 0;' },
          div({ style: 'display: inline-block;' },
            img({ src: 'images/edit_32.gif', style: 'vertical-align: middle;' })
          ),
          div({ style: 'display: inline-block; width: 80%' }, span('Continue Editing'))
        ) : Fundraiser.belongs_to(fundraiser.person) && div(
          info_message(
            !fundraiser.published && div(
              div({ style: 'text-align: center;' },
                p("You haven't published your fundraiser yet, so it isn't public."),
                p("Finish editing your fundraiser now to publish it!")
              )
            ),

            a({ 'class': 'blue', href: fundraiser.edit_url, style: 'padding: 5px 0;' },
              div({ style: 'display: inline-block; width: 25%;' },
                img({ src: 'images/edit_32.gif', style: 'vertical-align: middle;' })
              ),
              div({ style: 'display: inline-block; width: 75%' }, span('Edit'))
            ),
            br(),
            a({ 'class': 'blue', href: fundraiser.edit_url + '/info', style: 'padding: 5px 0;' },
              div({ style: 'display: inline-block; width: 25%px;' },
                img({ src: 'images/info_32.gif', style: 'vertical-align: middle;' })
              ),
              div({ style: 'display: inline-block; width: 75%' }, span('Info'))
            )
          )
        ),

        section({ id: 'fundraiser-stats', style: 'background: #eee; padding: 10px; margin: 10px 0; border-radius: 3px;' },
          ul({ style: 'list-style-type: none; padding: 0;' },
            li({ style: 'margin: 20px auto;' },
              span({ style: 'font-size: 45px; display: inline-block;' }, fundraiser.backers.length+''), br(), span({ style: 'margin-left: 5px; margin-top: 12px; display: inline-block;' }, 'backer' + (fundraiser.backers.length == 1 ? '' : 's'))
            ),

            li({ style: 'margin: 20px auto;' },
              span({ style: 'font-size: 45px; display: inline-block;' }, money(fundraiser.total_pledged||0)), br(), span({ style: 'margin-left: 5px; margin-top: 12px; display: inline-block;' }, 'pledged of ', money(fundraiser.funding_goal||0), ' goal')
            ),

            li({ style: 'margin: 20px auto;' },
              span({ style: 'font-size: 45px; display: inline-block;' }, fundraiser.days_remaining+''), br(), span({ style: 'margin-left: 5px; margin-top: 12px; display: inline-block;' }, 'day', (fundraiser.days_remaining == 1 ? '' : 's'), ' left')
            )
          ),

          form({ action: curry(Pledge.make_pledge, fundraiser.id) },
            messages(),

            // disable functionality of pledge button if not published
            options.preview ? [
              a({ 'class': 'green pledge-button' }, 'Make a Pledge')
            ] : [
              a({ 'class': 'green pledge-button', href: '#fundraisers/'+fundraiser.id+'/pledge' }, 'Make a Pledge')
            ]
          )
        ),

        (fundraiser.rewards.length > 0) && section({ id: 'fundraiser-rewards', style: 'background: #EEE; margin: 10px 0; border-radius: 3px; width: 100%;' },
          fundraiser.rewards.map(function(reward) {
            var reward_row_element = div(
              span({ style: 'font-size: 25px;' }, 'Pledge ', money(reward.amount), ' +'),

              (reward.limited_to > 0) && div({ style: 'margin: 10px 0 0 10px;; font-size: 14px;' },
                div({ style: 'font-style: italic; text-decoration: '+(reward.sold_out ? 'line-through' : 'none')+';' }, 'Limited: ', formatted_number(reward.limited_to - (reward.claimed||0)), ' of ', formatted_number(reward.limited_to), ' left'),
                reward.sold_out && div({ style: 'color: #DF2525;' }, 'Sold out!')
              ),

              p({ style: 'margin-left: 10px; white-space: pre-wrap;' }, reward.description)
            );

            if (reward.sold_out) {
              add_class(reward_row_element, 'sold-out');
            } else {
              reward_row_element.addEventListener('click', curry(set_route, '#fundraisers/'+fundraiser.id+'/pledge?reward_id='+reward.id));
            }

            return reward_row_element;
          })
        )
      ),

      div({ 'class': 'split-end' })
    );

    return fundraiser_form;
  });
}
