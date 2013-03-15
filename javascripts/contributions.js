with (scope('Contributions', 'App')) {
  before_filter(require_login);

  route('#contributions', function() {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#bounties' }, 'All Projects'),
        'Contributions'
      ),
      target_div
    );

    BountySource.user_info(function(response) {
      var user_info = response.data,
          all_contributions = flatten_to_array(user_info.bounties, user_info.pledges);

      if (all_contributions.length <= 0) {
        render({ into: target_div },
          info_message("You have not created any bounties yet. ", a({ href: '#' }, "Search for something to back."))
        );
      } else {
        render({ into: target_div },
          (user_info.bounties.length > 0) && section({ id: 'bounties-table' },
            h2("Bounties"),
            table(
              tr(
                th(),
                th('Project'),
                th({ style: 'width: 260px;' }, 'Issue'),
                th({ style: 'text-align: center;' }, 'Issue Status'),
                th('Bounty Amount'),
                th('Date')
              ),

              (user_info.bounties).map(function(bounty) {
                return tr({ style: 'height: 75px;' },
                  td({ style: 'width: 60px; text-align: center; vertical-align: middle;' },
                    img({ src: bounty.issue.tracker.image_url, style: 'width: 50px;' })
                  ),
                  td(a({ href: Repository.get_href(bounty.issue.tracker) }, bounty.issue.tracker.name)),
                  td(a({ href: Issue.get_href(bounty.issue) }, bounty.issue.title )),
                  td({ style: 'text-align: center;' }, Issue.status_element(bounty.issue)),
                  td(money(bounty.amount)),
                  td(formatted_date(bounty.created_at))
                )
              })
            )
          ),

          (user_info.pledges.length > 0) && section({ id: 'pledges-table' },
            h2("Fundraiser Pledges"),
            table(
              tr(
                th(),
                th({ style: 'width: 300px;' }, 'Fundraiser'),
                th('Pledge Amount'),
                th('Date')
              ),

              user_info.pledges.map(function(pledge) {
                return tr({ style: 'height: 75px;' },
                  td({ style: 'width: 60px; text-align: center; vertical-align: middle;' },
                    img({ src: pledge.fundraiser.image_url, style: 'width: 50px;' })
                  ),
                  td(a({ href: pledge.fundraiser.frontend_path }, pledge.fundraiser.title)),
                  td(money(pledge.amount)),
                  td(formatted_date(pledge.created_at))
                )
              })
            )
          )
        )
      }
    });
  });

  route('#fundraisers/:fundraiser_id/pledges/:pledge_id/receipt', function(fundraiser_id, pledge_id) {
    // if the pledge ID was not subbed into the URL, just go view the issue.
    // This will happen on Paypal cancel.
    if (/:pledge_id/.test(pledge_id)) return set_route('#fundraisers/'+fundraiser_id);

    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'Fundraisers',
        span({ id: 'breadcrumbs-fundraiser-title' }, 'Loading...'),
        'Pledge Receipt'
      ),
      target_div
    );

    BountySource.get_pledge(pledge_id, function(response) {
      if (response.meta.success) {
        var pledge = response.data;

        // render the title into the breadcrumbs
        render({ target: 'breadcrumbs-fundraiser-title' },
          a({ href: pledge.fundraiser.frontend_path }, truncate(pledge.fundraiser.title, 50))
        );

        render({ into: target_div },
          div({ style: 'text-align: center;' },
            h2(money(pledge.amount), " Pledge Made"),
            h3(pledge.fundraiser.title),

            pledge.reward && div({ style: 'margin: 10px; 0' },
              h4({ style: 'margin-bottom: 0;' }, 'Reward:'),
              p({ style: 'margin: 0 200px; padding: 10px;' }, pledge.reward.description)
            ),

            div(
              Facebook.create_share_button({
                link:         pledge.fundraiser.frontend_url,
                name:         "I just backed "+pledge.fundraiser.title,
                caption:      pledge.fundraiser.short_description,
                description:  "BountySource is the funding platform for open-source software, contribute by making a pledge to this fundraiser!",
                picture:      pledge.fundraiser.image_url || ''
              }, a({ 'class': 'btn-auth btn-facebook large', style: 'margin-right: 10px;' }, 'Share')),

              Twitter.create_share_button({
                url:  pledge.fundraiser.frontend_url,
                text: money(pledge.amount)+" pledge made to "+pledge.fundraiser.title,
                via:  'BountySource'
              }, a({ 'class': 'btn-auth btn-twitter large', style: 'margin-right: 10px;' }, 'Tweet'))
            )
          )
        );
      } else {
        render(error_message(response.data.error));
      }
    });
  });

  route('#fundraisers/:fundraiser_id/pledges/:pledge_id/survey', function(fundraiser_id, pledge_id) {
    // if the pledge ID was not subbed into the URL, just go view the issue.
    // This will happen on Paypal cancel.
    if (/:pledge_id/.test(pledge_id)) return set_route('#fundraisers/'+fundraiser_id);

    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'Fundraisers',
        span({ id: 'breadcrumbs-fundraiser-title' }, 'Loading...'),
        'Pledge Survey'
      ),
      target_div
    );

    define('redeem_reward', function(form_data) {
      BountySource.redeem_pledge_reward(pledge_id, form_data, function(response) {
        if (response.meta.success) {
          render_message(success_message("Your reward has been redeemed"));
        } else {
          render_message(error_message(response.data.error));
        }
      });
    });

    BountySource.get_pledge(pledge_id, function(response) {
      if (response.meta.success) {
        var pledge = response.data;
        var fundraiser = pledge.fundraiser;
        var reward = pledge.reward

        // render the title into the breadcrumbs
        render({ target: 'breadcrumbs-fundraiser-title' },
          a({ href: fundraiser.url }, abbreviated_text(fundraiser.title, 50))
        );

        render({ into: target_div },
          div({ style: 'text-align: center;' },
            h2(money(pledge.amount), " Pledge Made"),
            h3(fundraiser.title),

            reward && div({ style: 'margin: 10px; 0' },
              h4({ style: 'margin-bottom: 0;' }, 'Reward:'),
              p({ style: 'margin: 0 200px; padding: 10px;' }, reward.description)
            ),

            fundraiser.funding_goal_reached && reward.fulfillment_details && div(
              form({ 'class': 'fancy', action: redeem_reward },
                messages(),
                fieldset(
                  label({style: 'width: auto; font-weight: bold; padding: 0'}, reward.fulfillment_details),
                  br(),
                  textarea({style: 'width: 300px; height: 100px;', name: 'survey_response', placeholder: 'I want it to ship to the moon' })
                ),

                fieldset({ 'class': 'no-label', style: 'margin-left: 0' },
                  submit({class: 'green'}, 'Redeem reward')
                )
              )
            ),

            div(
              Facebook.create_share_button({
                link:         BountySource.www_host+fundraiser.url,
                name:         "I just backed "+fundraiser.title,
                caption:      fundraiser.short_description,
                description:  "BountySource is the funding platform for open-source software, contribute by making a pledge to this fundraiser!",
                picture:      fundraiser.image_url || ''
              }, a({ 'class': 'btn-auth btn-facebook large', style: 'margin-right: 10px;' }, 'Share')),

              Twitter.create_share_button({
                url:  BountySource.www_host+fundraiser.url,
                text: money(pledge.amount)+" pledge made to "+fundraiser.title,
                via:  'BountySource'
              }, a({ 'class': 'btn-auth btn-twitter large', style: 'margin-right: 10px;' }, 'Tweet'))
            )
          )
        );
      } else {
        render(error_message(response.data.error));
      }
    });
  });
}