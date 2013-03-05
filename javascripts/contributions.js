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
                th({ style: 'width: 60px;' }, 'Issue'),
                th({ style: 'width: 200px;' }),
                th({ style: 'text-align: center;' }, 'Issue Status'),
                th('Bounty Amount'),
                th('Date')
              ),

              (user_info.bounties).map(function(bounty) {
                return tr({ style: 'height: 75px;' },
                  td({ style: 'width: 60px; text-align: center; vertical-align: middle;' },
                    img({ src: bounty.repository.owner.avatar_url, style: 'width: 50px;' })
                  ),
                  td(a({ href: Repository.get_href(bounty.issue.repository) }, bounty.repository.full_name)),
                  td(a({ href: Issue.get_href(bounty.issue) }, '#'+bounty.issue.number )),
                  td({ style: 'color: #888' }, bounty.issue.title),
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
                  td(a({ href: pledge.fundraiser.url }, pledge.fundraiser.title)),
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

  route('#repos/:login/:repository/issues/:issue_number/bounties/:bounty_id/receipt', function(login, repository, issue_number, bounty_id) {
    // if the pledge ID was not subbed into the URL, just go view the issue.
    // This will happen on Paypal cancel.
    if (/:bounty_id/.test(bounty_id)) return set_route('#repos/'+login+'/'+repository+'/issues/'+issue_number);

    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#repos/' + login + '/' + repository }, login + '/' + repository),
        a({ href: '#repos/' + login + '/' + repository + '/issues' }, 'Issues'),
        a({ href: '#repos/' + login + '/' + repository + '/issues/' + issue_number }, '#' + issue_number),
        'Bounty Receipt'
      ),
      target_div
    );

    BountySource.get_bounty(bounty_id, function(response) {
      var bounty = response.data;

      render({ into: target_div },
        div({ style: 'text-align: center;' },
          h2(money(bounty.amount), " Bounty Placed"),
          h3(bounty.issue.repository.display_name),
          h3('Issue #', bounty.issue.number, ' - ', bounty.issue.title),

          div(
            Facebook.create_share_button({
              link:         BountySource.www_host+Issue.get_href(bounty.issue),
              name:         bounty.repository.display_name,
              caption:      money(bounty.amount)+' bounty placed on issue #'+bounty.issue.number+' - '+bounty.issue.title,
              description:  "BountySource is the funding platform for open-source software. Create a bounty to help get this issue resolved, or submit a pull request to earn the bounty yourself!",
              picture:      bounty.issue.repository.owner.avatar_url || ''
            }, a({ 'class': 'btn-auth btn-facebook large', style: 'margin-right: 10px;' }, 'Share')),

            Twitter.create_share_button({
              url:  BountySource.www_host+Issue.get_href(bounty.issue),
              text: money(bounty.amount)+" bounty placed",
              via:  'BountySource'
            }, a({ 'class': 'btn-auth btn-twitter large', style: 'margin-right: 10px;' }, 'Tweet')),

            // TODO fix it! --- CAB
            false && Github.issue_comment_form(bounty.issue, {
              default_text: "I placed a " + money(bounty.amount) + " bounty on this issue using BountySource. The bounty total goes to the person whose pull request gets accepted. Add to or claim the bounty here: " + BountySource.www_host+Issue.get_href(bounty.issue)
            })
          )
        )
      );
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
          a({ href: pledge.fundraiser.url }, abbreviated_text(pledge.fundraiser.title, 50))
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
                link:         BountySource.www_host+pledge.fundraiser.url,
                name:         "I just backed "+pledge.fundraiser.title,
                caption:      pledge.fundraiser.short_description,
                description:  "BountySource is the funding platform for open-source software, contribute by making a pledge to this fundraiser!",
                picture:      pledge.fundraiser.image_url || ''
              }, a({ 'class': 'btn-auth btn-facebook large', style: 'margin-right: 10px;' }, 'Share')),

              Twitter.create_share_button({
                url:  BountySource.www_host+pledge.fundraiser.url,
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