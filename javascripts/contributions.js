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

      console.log(user_info);

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

                (user_info.bounties||[]).map(function(bounty) {
                  return tr({ style: 'height: 75px;' },
                    td({ style: 'width: 60px; text-align: center; vertical-align: middle;' },
                      img({ src: bounty.repository.user.avatar_url, style: 'width: 50px;' })
                    ),
                    td(a({ href: Repository.get_href(bounty.issue.repository) }, bounty.repository.full_name)),
                    td(a({ href: Issue.get_href(bounty.issue) }, '#'+bounty.issue.number )),
                    td({ style: 'color: #888' }, bounty.issue.title),
                    td({ style: 'text-align: center;' }, Issue.status_element(bounty.issue)),
                    td(money(bounty.amount)),
                    td(date(bounty.created_at))
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
                  td(a({ href: '#fundraisers/'+pledge.fundraiser.id }, pledge.fundraiser.title)),
                  td(money(pledge.amount)),
                  td(date(pledge.created_at))
                )
              })
            )
          )
        )
      }
    });
  });

  route('#repos/:login/:repository/issues/:issue_number/contributions/receipt', function(login, repository, issue_number) {
    var github_comment_div = div(),
        bounty_amount = parseInt(get_params().amount);

    // render a comment submit form, or a GitHub account link button
    if (Github.account_linked()) {
      render({ into: github_comment_div },
        form({ style: 'width: 650px;', action: curry(post_github_comment, login, repository, issue_number) },
          messages(),

          fieldset(
            textarea({ 'class': 'fancy', name: 'body', style: 'width: 100%; height: 150px;' }, "Working on a solution? \n\nA $"+bounty_amount+" bounty has been placed on it at [BountySource](https://www.bountysource.com), and you can earn it by having your pull request merged. " + BountySource.www_host+'#repos/'+login+'/'+repository+'/issues/'+issue_number)
          ),
          fieldset(
            submit({ 'class': 'green', style: 'width: 230px; margin-top: 15px;' }, 'Comment on GitHub Issue')
          )
        )
      );
    } else {
      render({ into: github_comment_div },
        p("You need to have a GitHub account first."),
        // link GitHub account, and redirect here afterward.
        Github.link_requiring_auth({ 'class': 'blue', style: 'width: 250px;', href: get_route() }, 'Link Your GitHub Account')
      )
    }

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#repos/' + login + '/' + repository }, login + '/' + repository),
        a({ href: '#repos/' + login + '/' + repository + '/issues' }, 'Issues'),
        a({ href: '#repos/' + login + '/' + repository + '/issues/' + issue_number }, '#' + issue_number),
        'Bounty Receipt'
      ),

      div({ 'class': 'split-main'},
        h2("Your Bounty Has Been Posted"),
        p("A couple of things you should know:"),
        ul(
          li("Every bounty has a six-month limit. We'll refund you if this issue isn't closed by then."),
          li("We'll keep you posted on the status of this issue via email, but you can check its issue page at any time too."),
          li("Once an issue is closed, you will have two weeks to verify the solution and file a dispute if necessary.")
        ),
        p("More questions? ", a({ href: '#faq' }, 'Consult the FAQ'), ", ", a({ href: 'mailto:support@bountysource.com', target: '_blank' }, 'email us'), ", or ", a({ href: 'irc://irc.freenode.net/bountysource' }, 'message us via IRC'), "."),
        p("Thank you for supporting open-source software!"),

        br(),

        h2("Spread The Word!"),
        p("Encourage developers to start working on a solution, and encourage other backers to create bounties on the same issue."),

        github_comment_div
      ),

      div({ 'class': 'split-side'},
        div({ style: 'background: #f1f1f1; padding: 0 21px 21px 21px; margin: 20px 15px; border-bottom: 1px solid #e3e3e3;' },
          ribbon_header("Links"),
          br(),
          a({ 'class': 'blue', href: '#repos/'+login+'/'+repository }, "Back to Project"), br(),
          a({ 'class': 'blue', href: '#repos/'+login+'/'+repository+'/issues/'+issue_number }, "Back to Issue #"+issue_number)
        ),


        div({ style: 'background: #f1f1f1; padding: 0 21px 21px 21px; margin: 20px 15px; border-bottom: 1px solid #e3e3e3; text-align: center;' },
          ribbon_header('Share'),
          br(),
          facebook_share_bounty_button(login, repository, issue_number, bounty_amount),
          div({ style: 'height: 20px;' }),
          twitter_share_bounty_button(login, repository, issue_number, bounty_amount)
        )
      ),

      div({ 'class': 'split-end'})
    );
  });

  route('#fundraisers/:fundraiser_id/pledges/:pledge_id/receipt', function(fundraiser_id, pledge_id) {
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

    BountySource.get_pledge(pledge_id, function(response) {
      var pledge      = response.data,
          fundraiser  = pledge.fundraiser;

      render({ target: 'breadcrumbs-fundraiser-title' }, fundraiser.title);

      render({ into: target_div },
        div({ 'class': 'split-main' },
          h2("Thanks for your contribution"),
          p("Your contribution of ", money(pledge.amount), " has been made to ", fundraiser.title, "."),

          // ternary hell. if rewards disabled, show nothing. if reward claimed, show it, else show selection form
          (pledge.fundraiser.rewards.length > 0 &&) && (pledge.reward) ? div(
            h2("Selected Reward"),
            p("You selected the reward \"", pledge.reward.description ,"\"")
          ) : div(
            h2("Select a Reward"),
            form({ 'class': 'fancy', action: curry(redeem_reward, pledge_id) },
              messages(),

              section({ id: 'pledge-receipt-rewards', style: 'background: #EEE; margin: 10px 0; border-radius: 3px;' },
                (function() {
                  var elements = [], reward;
                  for (var i=0; i<fundraiser.rewards.length; i++) {
                    reward = fundraiser.rewards[i];
                    var element = div({ style: 'min-height: 100px; padding: 15px;' },
                      radio({ name: 'reward', value: reward.id }), span({ style: 'font-size: 25px; margin-left: 15px;' }, 'Pledge ', money(reward.amount), ' +'),

                      // TODO show number remaining if quantity limited
                      (reward.limited_to > 0) && p({ style: 'margin-left: 10px; font-size: 14px; font-style: italic;' }, 'Limited: ', formatted_number(reward.limited_to - (reward.num_claimed||0)), ' of ', formatted_number(reward.limited_to), ' left'),

                      p({ style: 'margin-left: 10px;' }, reward.description)
                    );
                    if (i < (fundraiser.rewards.length-1)) element.style['border-bottom'] = '2px dotted #C7C7C7';
                    elements.push(element);
                  }
                  return elements;
                })()
              ),

              submit({ 'class': 'green' }, "Redeem Reward")
            )
          )
        ),

        div({ 'class': 'split-side' },
          div({ style: 'background: #f1f1f1; padding: 0 21px 21px 21px; margin: 20px 15px; border-bottom: 1px solid #e3e3e3;' },
            ribbon_header("Links"),
            br(),
            a({ 'class': 'green', href: '#fundraisers/'+fundraiser_id }, "Back to Fundraiser")
          ),

          div({ style: 'background: #f1f1f1; padding: 0 21px 21px 21px; margin: 20px 15px; border-bottom: 1px solid #e3e3e3; text-align: center;' },
            ribbon_header('Share'),
            br(),
            facebook_share_pledge_button(pledge),
            div({ style: 'height: 20px;' }),
            twitter_share_pledge_button(pledge)
          )
        ),

        div({ 'class': 'split-end' })
      );
    });
  });

  define('redeem_reward', function(pledge_id, form_data) {
    if (confirm("Redeem reward?")) {
      BountySource.redeem_reward(pledge_id, form_data.reward, function(response) {
        if (response.meta.success) {
          window.location.reload();
        } else {
          render_message(error_message(response.data.error));
        }
      });
    }
  });

  define('facebook_share_bounty_button', function(login, repository, issue_number, bounty_amount) {
    return a({ style: 'display: inline-block; cursor: pointer;', onclick: function() { window.open(share_bounty_on_facebook_url(login, repository, issue_number, bounty_amount),'','width=680,height=350') } }, img({ src: 'images/share-button-facebook.png', style: 'border-radius: 3px;' }));
  });

  define('twitter_share_bounty_button', function(login, repository, issue_number, bounty_amount) {
    return a({ style: 'display: inline-block; cursor: pointer;', onclick: function() { window.open(share_bounty_on_twitter_url(login, repository, issue_number, bounty_amount),'','width=680,height=350') } }, img({ src: 'images/share-button-twitter.png', style: 'border-radius: 3px;' }));
  });

  define('facebook_share_pledge_button', function(pledge) {
    return a({ style: 'display: inline-block; cursor: pointer;', onclick: function() { window.open(share_pledge_on_facebook_url(pledge),'','width=680,height=350') } }, img({ src: 'images/share-button-facebook.png', style: 'border-radius: 3px;' }));
  });

  define('twitter_share_pledge_button', function(pledge) {
    return a({ style: 'display: inline-block; cursor: pointer;', onclick: function() { window.open(share_pledge_on_twitter_url(pledge),'','width=680,height=350') } }, img({ src: 'images/share-button-twitter.png', style: 'border-radius: 3px;' }));
  });

  define("share_pledge_on_facebook_url", function(pledge) {
    return "https://www.facebook.com/dialog/feed?"
      + "app_id="           + 280280945425178
      + "&display="         + "popup"
      + "&link="            + encode_html(BountySource.www_host+'#fundraisers/'+pledge.fundraiser.id)
      + "&redirect_uri="    + encode_html(BountySource.api_host+"kill_window_js")
      + "&name="            + "I pledged " + money(pledge.amount) + " to " + pledge.fundraiser.title + " through BountySource."
      + "&caption="         + "BountySource is a funding platform for open-source bugs and features."
      + "&description="     + "Help fund this project, give back to Open Source!";
  });

  define('share_pledge_on_twitter_url', function(pledge) {
    return "https://twitter.com/share?"
      + "url="    + encode_html(BountySource.www_host+'#fundraisers/'+pledge.fundraiser.id)
      + "&text="  + "I pledged " + money(pledge.amount) + " to " + pledge.fundraiser.title + " through BountySource.";
  });

  define('share_bounty_on_facebook_url', function(login, repository, issue_number, amount) {
    return "https://www.facebook.com/dialog/feed?"
      + "app_id="           + 280280945425178
      + "&display="         + "popup"
      + "&link="            + encode_html(BountySource.www_host+'#repos/'+login+'/'+repository+'/issues/'+issue_number)
      + "&redirect_uri="    + encode_html(BountySource.api_host+"kill_window_js")
      + "&name="            + "I placed a $"+amount+" bounty on this issue at BountySource."
      + "&caption="         + "BountySource is a funding platform for open-source bugs and features."
      + "&description="     + "Working on a solution? A bounty has been placed on it at BountySource, and you can earn it by having your pull request merged.";
  });

  define('share_bounty_on_twitter_url', function(login, repository, issue_number, amount) {
    return "https://twitter.com/share?"
      + "url="    + encode_html(BountySource.www_host+'#repos/'+login+'/'+repository+'/issues/'+issue_number)
      + "&text="  + "I placed a $"+amount+" bounty on this issue at @BountySource.";
  });

  define('post_github_comment', function(login, repository, issue_number, form_data) {
    clear_message();

    BountySource.post_github_comment(login, repository, issue_number, form_data, function(response) {
      console.log(response);

      if (response.meta.success) {
        render_message(success_message('Comment posted on issue!'));
      } else {
        render_message(error_message(response.data.error));
      }
    });
  });
}