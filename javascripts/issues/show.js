with (scope('Issue', 'App')) {

  route('#repos/:login/:repository/issues/:issue_number', function(login, repository, issue_number) {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#repos/' + login + '/' + repository }, login + '/' + repository),
        a({ href: '#repos/' + login + '/' + repository + '/issues' }, 'Issues'),
        '#' + issue_number
      ),

      target_div
    );

    BountySource.get_issue(login, repository, issue_number, function(response) {
      var issue = response.data||{};

      App.update_facebook_like_button({
        name:         issue.repository.display_name+": Issue #"+issue.number,
        caption:      issue.title,
        description:  "BountySource is the funding platform for open-source software. Create a bounty to have this issue resolved, or submit a pull request to earn the bounty yourself!",
        picture:      issue.repository.owner.avatar_url
      });

      render({ into: target_div },
        div({ 'class': 'split-main' },

          // used to render messages into
          messages(),

          // title of issue, with closed or open notification.
          // if issue is closed, add line-through
          h1({ style: 'font-size: 26px; line-height: 30px; font-weight: normal; color: #565656' }, 
            span({ style: issue.closed ? 'text-decoration: line-through;' : '' }, '#' + issue.number + ': ' + issue.title),
            div({ style: 'padding-left: 20px; display: inline-block;' }, Issue.status_element(issue))
          ),

          github_user_html_box({ user: issue.user, body_html: issue.body, created_at: issue.remote_created_at }),

          div({ style: 'margin: 25px 0;' },
            div({ style: 'display: inline-block; vertical-align: middle; margin-right: 10px;' }, 'For more information, or to comment:'),
            a({ 'class': 'btn-auth btn-github', style: 'display: inline-block; vertical-align: middle;', href: issue.url, target: '_blank' }, 'View Issue on GitHub')
          ),

          issue.comments.length > 0 && div(
            h2({ style: 'font-size: 26px; line-height: 30px; font-weight: normal; color: #565656' }, 'Comments'),
            issue.comments.map(github_user_html_box)
          )
        ),

        div({ 'class': 'split-side'},
          !issue.closed && !issue.code && section(
            bounty_box(issue),
            developer_box(issue)
          )
        ),

        div({ 'class': 'split-end' })
      );
    });
  });
  
  define('github_user_html_box', function(options) {
    var user = options.user;

    return div({ style: 'margin-bottom: -1px' },
      img({ src: user.avatar_url, style: 'width: 50px; height: 50px; float: left' }),

      div({ style: 'margin-left: 70px; background: #f7f7f7; border-top: 1px solid #e3e3e3; border-bottom: 1px solid #e3e3e3; overflow: auto; padding: 10px;' },
        div({ style: 'color: #b4b4b4; margin-bottom: 6px' }, user.login, ' commented ', time_ago_in_words(options.created_at), ' ago:'),
      
        div({ 'class': 'gfm', html: options.body_html })
      )
    );
  });
  
  define('bounty_box', function(issue) {
    return div({ id: 'bounty-box' },
      div({ style: 'padding: 0 21px' }, ribbon_header("Backers")),
      
      issue.bounty_total > 0 && section(
        div({ 'class': 'total_bounties' }, money(issue.bounty_total)),
        div({ style: 'text-align: center' }, "From ", issue.bounties.length, " bount" + (issue.bounties.length == 1 ? 'y' : 'ies') + ".")
      ),

      Payment.payment_box({
        item_number: 'github/' + issue.repository.full_name + '/issues/' + issue.number,
        success_url: window.location.href.split('#')[0] + '#repos/' + issue.repository.full_name + '/issues/' + issue.number + '/bounties/:item_id/receipt',
        cancel_url: window.location.href.split('#')[0] + '#repos/' + issue.repository.full_name + '/issues/' + issue.number
      })
    );
  });
  
  define('developer_box', function(issue) {
    var developer_div = div({ id: 'developer-box' }, p({ style: 'text-align: center;' }, 'Loading...'));

    var link_github_account_content = div({ style: 'text-align: center;' },
      info_message("Want to submit a pull request to solve this issue and earn the bounty?"),
      a({ 'class': 'btn-auth btn-github large hover', style: 'font-size: 16px;', href: Github.auth_url() }, "Link with GitHub")
    );

    // if issue has solution, a pull request has already been submitted
    if (issue.solution) {
      var pull_request = issue.solution.pull_request;
      render({ into: developer_div },
        success_message({ style: 'margin: 0;' }, "Pull request submitted."),
        br(),
        a({ 'class': 'green', href: Solution.get_href(issue.solution) }, 'View Solution')
      )
    } else if (!logged_in()) {
      render({ into: developer_div }, link_github_account_content);
    } else {
      BountySource.get_cached_user_info(function(user_info) {
        if (logged_in() && user_info.github_user) {
          // asynchronously load pull requests for the repo
          BountySource.get_pull_requests(issue.repository.owner.login, issue.repository.name, user_info.github_user.login, function(response) {
            if (response.meta.success) {
              if (response.data.length <= 0) {
                render({ into: developer_div },
                  info_message({ style: 'margin: 0; text-align: center;' },
                    span("Submit a pull request through ", a({ href: 'https://github.com/'+issue.repository.full_name, target: '_blank' }, "GitHub"), ", then you can select it as a solution here.")
                  )
                );
              } else {
                render({ into: developer_div },

                  form({ action: curry(create_solution, issue.repository.owner.login, issue.repository.name, issue.number), style: 'text-align: center;' },
                    div({ id: 'developer-box-messages' }),

                    span({ style: 'margin-bottom: 10px; display: block;' }, "Your pull requests for ", a({ href: 'https://github.com/'+issue.repository.full_name+'/pulls', target: '_blank' }, issue.repository.full_name), ':'),

                    select({ name: 'pull_request_number', style: 'width: 100%; margin-bottom: 15px;' },
                      response.data.map(function(pull_request) {
                        return option({ value: pull_request.number }, '#'+pull_request.number+': '+pull_request.title)
                      })
                    ),

                    submit({ 'class': 'green' }, "Submit Solution")
                  )
                );
              }
            }
          });
        } else {
          render({ into: developer_div }, link_github_account_content);
        }
      });
    }

    return div({ style: 'background: #f1f1f1; padding: 0 21px 21px 21px; margin: 20px 15px; border-bottom: 1px solid #e3e3e3;' },
      ribbon_header("Developers"),
      br(),
      developer_div
    );
  });
  
  define('create_solution', function(login, repository, issue_number, form_data) {
    // hide('developer-box');

    BountySource.create_solution(login, repository, issue_number, form_data.pull_request_number, function(response) {
      if (response.meta.success) {
        set_route('#solutions/'+response.data.id+'/receipt');
      } else {
        render({ target: 'developer-box-messages' }, error_message(response.data.error));
      }
    });
  });
}
