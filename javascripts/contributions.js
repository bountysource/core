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
          (user_info.bounties.length > 0) && render({ into: target_div },
            section({ id: 'bounties-table' },
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
                    img({ src: pledge.fundraiser.avatar_url, style: 'width: 50px;' })
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
    // access token as a param?
    // TODO: remove when new account creation is ready -- CAB
    var params = get_params();
    if (params['access_token']) {
      BountySource.set_access_token(params['access_token']);
      set_route(get_route(), { reload_page: true });
      return;
    }

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
              link:     BountySource.www_host+Issue.get_href(bounty.issue),
              name:     bounty.repository.display_name,
              caption:  money(bounty.amount)+' bounty placed on issue #'+bounty.issue.number+' - '+bounty.issue.title
            }, a({ 'class': 'btn-auth btn-facebook large', style: 'margin-right: 10px;' }, 'Share')),

            Twitter.create_share_button({
              url:  BountySource.www_host+Issue.get_href(bounty.issue),
              text: money(bounty.amount)+" bounty placed",
              via:  'BountySource'
            }, a({ 'class': 'btn-auth btn-twitter large', style: 'margin-right: 10px;' }, 'Tweet')),

            Github.issue_comment_form(bounty.issue, {
              default_text: "I placed a " + money(bounty.amount) + " dollar bounty on this issue using BountySource. The bounty total goes to the person whose pull request gets accepted. Add to or claim the bounty here: " + bounty.issue.url
            })
          )
        )
      );
    });
  });

  route('#fundraisers/:fundraiser_id/pledges/:pledge_id/receipt', function(fundraiser_id, pledge_id) {
    // access token as a param?
    // TODO: remove when new account creation is ready -- CAB
    var params = get_params();
    if (params['access_token']) {
      BountySource.set_access_token(params['access_token']);
      set_route(get_route(), { reload_page: true });
      return;
    }

    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'Fundraisers',
        a({ id: 'breadcrumbs-fundraiser-title', href: '#fundraisers/'+fundraiser_id }, 'Loading...'),
        'Receipt'
      ),
      target_div
    );

    // if the pledge ID was not subbed into the URL, just go view the issue.
    // This will happen on Paypal cancel.
    if (/:pledge_id/.test(pledge_id)) return set_route('#fundraisers/'+fundraiser_id);

    BountySource.get_pledge(pledge_id, function(response) {
      if (response.meta.success) {
        var pledge      = response.data,
            fundraiser  = pledge.fundraiser;

        render({ target: 'breadcrumbs-fundraiser-title' }, abbreviated_text(fundraiser.title, 60));

        render({ into: target_div },
          div({ 'class': 'split-main' },
            h2("Thanks for your contribution"),
            p("You are now a backer of ", fundraiser.title, ". Thanks for supporting open source software!"),

            h3("Tell your friends!"),
            div(
              Facebook.create_share_button({
                link:     BountySource.www_host+pledge.fundraiser.url,
                name:     pledge.fundraiser.title,
                caption:  pledge.fundraiser.short_description
              }, a({ 'class': 'btn-auth btn-facebook', style: 'margin-right: 10px;' }, 'Share')),

              Twitter.create_share_button({
                url:  BountySource.www_host+pledge.fundraiser.url,
                text: "I pledged "+money(pledge.amount)+" to "+fundraiser.title
              }, a({ 'class': 'btn-auth btn-twitter' }, 'Tweet'))
            )
          ),

          div({ 'class': 'split-side' },
            div({ style: 'margin-top: 20px;' },
              span({ style: 'color: gray;' }, 'Pledge Amount:'),
              div({ style: 'margin: 10px 0 10px 20px;' },
                span({ style: 'font-size: 25px;'}, money(pledge.amount))
              ),

              pledge.reward && div(
                span({ style: 'color: gray;' }, 'Selected Reward:'),
                div({ style: 'margin: 10px 0 10px 20px;' },
                  span({ style: 'white-space: pre-wrap;' }, pledge.reward.description)
                )
              )
            )
          ),

          div({ 'class': 'split-end' })
        );
      } else {
        render({ into: target_div }, error_message(response.data.error));
      }
    });
  });
}