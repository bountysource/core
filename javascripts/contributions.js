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

  route('#repos/:login/:repository/issues/:issue_number/bounties/:bounty_id/receipt', function(login, repository, issue_number, bounty_id) {
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

    // if the bounty ID was not subbed into the URL, just go view the issue.
    // This will happen on Paypal cancel.
    if (/:bounty_id/.test(bounty_id)) return set_route('#repos/'+login+'/'+repository+'/issues/'+issue_number);


    BountySource.get_bounty(bounty_id, function(response) {
      var github_comment_div  = div(),
          bounty              = response.data;

      // render a comment submit form, or a GitHub account link button
      if (Github.account_linked()) {
        render({ into: github_comment_div },
          form({ style: 'width: 650px;', action: curry(post_github_comment, login, repository, issue_number) },
            messages(),

            fieldset(
              textarea({ 'class': 'fancy', name: 'body', style: 'width: 100%; height: 150px;' }, "Working on a solution? \n\nA "+money(bounty.amount)+" bounty has been placed on it at [BountySource](https://www.bountysource.com), and you can earn it by having your pull request merged. " + BountySource.www_host+'#repos/'+login+'/'+repository+'/issues/'+issue_number)
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
          a({ 'class': 'blue', style: 'width: 250px;', href: Github.auth_url() }, 'Link Your GitHub Account')
        )
      }

      render({ into: target_div },
        div({ 'class': 'split-main'},
          h2("Bounty Created!"),
          p("Thank you for supporting open-source software!"),
          p("Questions? ", a({ href: '#faq' }, 'Consult the FAQ'), ", ", a({ href: 'mailto:support@bountysource.com', target: '_blank' }, 'email us'), ", or ", a({ href: 'irc://irc.freenode.net/bountysource' }, 'message us via IRC'), "."),

          br(),

          h2("Spread The Word!"),

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
            facebook_share_bounty_button(login, repository, issue_number, bounty.amount),
            div({ style: 'height: 20px;' }),
            twitter_share_bounty_button(login, repository, issue_number, bounty.amount)
          )
        ),

        div({ 'class': 'split-end'})
      );
    });
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

    // if the pledge ID was not subbed into the URL, just go view the issue.
    // This will happen on Paypal cancel.
    if (/:pledge_id/.test(pledge_id)) return set_route('#fundraisers/'+fundraiser_id);

    BountySource.get_pledge(pledge_id, function(response) {
      var pledge      = response.data,
          fundraiser  = pledge.fundraiser,
          rewards_div = div();

      render({ target: 'breadcrumbs-fundraiser-title' }, fundraiser.title);

      render({ into: target_div },
        div({ 'class': 'split-main' },
          h2("Thanks for your contribution"),
          p("Your contribution of ", money(pledge.amount), " has been made to ", fundraiser.title, "."),

          pledge.reward && div(
            h2("Selected Reward"),
            p("You selected the reward \"", pledge.reward.description ,"\"")
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

  define('facebook_share_bounty_button', function(login, repository, issue_number, bounty_amount) {
    return Facebook.share_dialog_button(share_bounty_on_facebook_url(login, repository, issue_number, bounty_amount));
  });

  define('twitter_share_bounty_button', function(login, repository, issue_number, bounty_amount) {
    return Twitter.share_dialog_button(share_bounty_on_twitter_url(login, repository, issue_number, bounty_amount));
  });

  define('facebook_share_pledge_button', function(pledge) {
    return Facebook.share_dialog_button(share_pledge_on_facebook_url(pledge));
  });

  define('twitter_share_pledge_button', function(pledge) {
    return Twitter.share_dialog_button(share_pledge_on_twitter_url(pledge));
  });

  define("share_pledge_on_facebook_url", function(pledge) {
    return Facebook.share_dialog_url({
      link:         encode_html(BountySource.www_host+'#fundraisers/'+pledge.fundraiser.id),
      title:        "I pledged " + money(pledge.amount) + " to " + pledge.fundraiser.title + " through BountySource.",
      description:  "Help fund this project, give back to Open Source!"
    });
  });

  define('share_pledge_on_twitter_url', function(pledge) {
    return Twitter.share_dialog_url({
      url:  encode_html(BountySource.www_host+'#fundraisers/'+pledge.fundraiser.id),
      text: "I pledged " + money(pledge.amount) + " to " + pledge.fundraiser.title + " through @BountySource."
    });
  });

  define('share_bounty_on_facebook_url', function(login, repository, issue_number, amount) {
    return Facebook.share_dialog_url({
      link:         encode_html(BountySource.www_host+'#repos/'+login+'/'+repository+'/issues/'+issue_number),
      title:        "I placed a "+money(amount)+" bounty on this issue at BountySource.",
      description:  "A bounty has been placed on this issue at BountySource."
    });
  });

  define('share_bounty_on_twitter_url', function(login, repository, issue_number, amount) {
    return Twitter.share_dialog_url({
      url:  encode_html(BountySource.www_host+'#repos/'+login+'/'+repository+'/issues/'+issue_number),
      text: "I placed a "+money(amount)+" bounty on this issue at @BountySource."
    });
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