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
      var user_info = response.data;

      if (!user_info.bounties || user_info.bounties.length <= 0) {
        render({ into: target_div },
          info_message("You have not yet made any contributions or placed any bounties. ", a({ href: '#' }, "Search for something to back."))
        );
      } else {
        render({ into: target_div },
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
        );
      }
    });
  });


  route('#repos/:login/:repository/issues/:issue_number/contributions/receipt', function(login, repository, issue_number) {
    var github_comment_div = div(),
        bounty_amount = parseInt(get_params().amount);

    // render a comment submit form, or a GitHub account link button
    if (github_account_linked()) {
      render({ into: github_comment_div },
        form({ style: 'width: 650px;', action: curry(post_github_comment, login, repository, issue_number) },
          messages(),

          fieldset(
            textarea({ 'class': 'fancy', name: 'body', style: 'width: 100%; height: 150px;' }, "Looking to submit a pull request to resolve this issue? \n\nA $"+bounty_amount+" bounty has been placed on it at [BountySource](https://www.bountysource.com), and you can earn it by having your pull request merged. " + BountySource.www_host+'#repos/'+login+'/'+repository+'/issues/'+issue_number)
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
          li("Every bounty has a six-month limit. isn't closed within this window, you get a refund."),
          li("We will keep you posted about the issue status via email. For instance, when a developer submits a solution, you will be notified.")
        ),
        p("Have any more questions? ", a({ href: '#faq' }, 'consult the FAQs'), ", ", a({ href: 'mailto:support@bountysource.com', target: '_blank' }, 'email us'), ", or ", a({ href: 'irc://irc.freenode.net/bountysource' }, 'message us via IRC'), "."),
        p("Thank you for supporting open source software!"),

        br(),

        h2("Get the Word Out"),
        p("Now that there is a bounty on this issue, spread the word! Get some developers to start working on solutions, or encourage others to place bounties as well."),

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
          facebook_share_button(login, repository, issue_number, bounty_amount),
          div({ style: 'height: 20px;' }),
          twitter_share_button(login, repository, issue_number, bounty_amount)
        )
      ),

      div({ 'class': 'split-end'})
    );
  });

  define('facebook_share_button', function(login, repository, issue_number, bounty_amount) {
    return a({ style: 'display: inline-block; cursor: pointer;', onclick: function() { window.open(share_bounty_on_facebook_url(login, repository, issue_number, bounty_amount),'','width=680,height=350') } }, img({ src: 'images/share-button-facebook.png', style: 'border-radius: 3px;' }));
  });

  define('twitter_share_button', function(login, repository, issue_number, bounty_amount) {
    return a({ style: 'display: inline-block; cursor: pointer;', onclick: function() { window.open(share_bounty_on_twitter_url(login, repository, issue_number, bounty_amount),'','width=680,height=350') } }, img({ src: 'images/share-button-twitter.png', style: 'border-radius: 3px;' }));
  });

  define('share_bounty_on_facebook_url', function(login, repository, issue_number, amount) {
    return "https://www.facebook.com/dialog/feed?"
      + "app_id="           + 280280945425178
      + "&display="         + "popup"
      + "&link="            + encodeURIComponent(BountySource.www_host+'#repos/'+login+'/'+repository+'/issues/'+issue_number)
      + "&redirect_uri="    + encodeURIComponent(BountySource.api_host+"kill_window_js")
      + "&name="            + "I placed a $"+amount+" bounty on this issue at BountySource"
      + "&caption="         + "BountySource is a funding platform for open-source bugs and features."
      + "&description="     + "Looking to submit a pull request to resolve this issue? A bounty has been placed on it at BountySource, and you can earn it by having your pull request merged.";
  });

  define('share_bounty_on_twitter_url', function(login, repository, issue_number, amount) {
    return "https://twitter.com/share?"
      + "url="    + encodeURIComponent(BountySource.www_host+'#repos/'+login+'/'+repository+'/issues/'+issue_number)
      + "&text="  + "I placed a $"+amount+" bounty on this issue through @BountySource.";
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