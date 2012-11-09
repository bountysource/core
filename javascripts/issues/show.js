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

      render({ into: target_div },
        div({ 'class': 'split-main' },

          // used to render messages into
          messages(),

          // title of issue, with closed or open notification
          h1({ style: 'font-size: 26px; line-height: 30px; font-weight: normal; color: #565656' }, 
            '#' + issue.number + ': ' + issue.title,
            div({ style: 'padding-left: 20px; display: inline-block;' }, Issue.status_element(issue))
          ),
          
          github_user_html_box({ user: issue.user, body_html: issue.body, created_at: issue.remote_created_at }),

          issue.comments.length > 0 && div(
            h2({ style: 'font-size: 26px; line-height: 30px; font-weight: normal; color: #565656' }, 'Comments'),
            issue.comments.map(github_user_html_box)
          )
          
          // issue.events.length > 0 && div(
          //   h2('Events'),
          //   issue.events.map(function(event) {
          //     return div({ style: 'border: 1px solid #888; padding: 5px; margin-bottom: 20px' },
          //       img({ src: event.actor.avatar_url, style: 'float: left; width:80px; height:80px' }),
          //       b(event.actor.login), ' on ', event.created_at,
          //       div(event.event),
          //       div(event.commit_id),
          //       div({ style: 'clear: left' })
          //     );
          //   })
          // )
          
        ),

        div({ id: 'sidebar', 'class': 'split-side' }),

        div({ 'class': 'split-end' })
      );

      // asynchronously load user info to check permissions on github user
      BountySource.get_cached_user_info(function(user_info) {
        !issue.closed && !issue.code && render({ into: 'sidebar' },
          bounty_box(issue),
          developer_box(issue, user_info)
          //misc_box(issue)
        );
      });
    });
  });
  
  define('github_user_html_box', function(options) {
    var user = options.user;

    return div({ style: 'margin-bottom: -1px' },
      img({ src: user.avatar_url, style: 'width: 50px; height: 50px; float: left' }),

      div({ 'class': 'github_html', style: 'margin-left: 70px; background: #f7f7f7; border-top: 1px solid #e3e3e3; border-bottom: 1px solid #e3e3e3; overflow: auto; padding: 10px;' },
        div({ style: 'color: #b4b4b4; margin-bottom: 6px' }, user.login, ' commented ', time_ago_in_words(options.created_at), ' ago:'),
      
        div({ html: options.body_html })
      )
    );
  });
  
  define('bounty_box', function(issue) {
    var bountysource_account_div = div();

    return div({ id: 'bounty-box' },
      div({ style: 'padding: 0 21px' }, ribbon_header("Backers")),
      
      issue.bounty_amount > 0 && section(
        div({ 'class': 'total_bounties' }, money(issue.bounty_amount)),
        div({ style: 'text-align: center' }, "From ", issue.bounties.length, " bount" + (issue.bounties.length == 1 ? 'y' : 'ies') + ".")
        
        
        // issue.bounties && (issue.bounties.length > 0) && div(
        //   issue.bounties.map(function(bounty) {
        //     return div(money(bounty.amount));
        //   })
        // )
      ),

      section({ style: 'padding: 21px' },
        form({ action: curry(create_bounty, issue.repository.owner, issue.repository.name, issue.number) },
          div({ id: 'create-bounty-errors' }),

          div({ 'class': 'amount' },
            label({ 'for': 'amount-input' }, '$'),
            text({ placeholder: "25", name: 'amount', id: 'amount-input' })
          ),
          div({ 'class': 'payment-method' },
            div(radio({ name: 'payment_method', value: 'paypal', id:'payment_method_paypal',
                        checked: 'checked' }),
                label({ 'for': 'payment_method_paypal' },
                      img({ src: 'images/paypal.png'}), "PayPal")),
            div(radio({ name: 'payment_method', value: 'google', id:'payment_method_google' }),
                label({ 'for': 'payment_method_google' },
                      img({ src: 'images/google-wallet.png'}), "Google Wallet")),
//            div(radio({ name: 'payment_method', value: 'amazon', id:'payment_method_amazon' }),
//                label({ 'for': 'payment_method_amazon' },
//                      img({ src: 'images/amazon.png'}), "Amazon.com")),

            bountysource_account_div
          ),

          submit({ 'class': 'blue' }, 'Create Bounty')
        )
      )
    );
  });
  
  define('developer_box', function(issue, user_info) {
    var developer_div = div({ id: 'developer-box' });

    if (Github.account_linked()) {
      // render message if read-only permissions
      if ((user_info.github_user.permissions||[]).indexOf('public_repo') < 0) {
        render({ into: developer_div },
          info_message(
            div({ style: 'text-align: center;' },
              img({ style: 'width: 75px; border-radius: 3px;', src: user_info.github_user.avatar_url }), span(user_info.github_user.login)
            ),
            span({ style: 'margin-top: 10px; display: block;' }, "Your GitHub account is linked, but we need write permissions to create an issue branch.")
          ),
          Github.link_requiring_auth({ scope: 'public_repo' }, 'Update Permissions')
        );
      } else {
        IssueBranch.get_solution(issue.repository.user.login, issue.repository.name, issue.number, function(solution) {
          if (solution) {
            render({ into: developer_div },
              a({ 'class': 'green', href: '#repos/'+issue.repository.owner+'/'+issue.repository.name+'/issues/'+issue.number+'/issue_branch' }, 'View Issue Branch')
            );
          } else {
            var advanced_box = div({ id: 'advanced-developer-box', style: "margin: 10px 0; display: none"},
              b('Name: '), text({ name: 'branch_name', value: 'issue'+issue.number, style: 'width: 100px' })
            );

            render({ into: developer_div },
              form({ action: curry(create_solution, issue.repository.owner, issue.repository.name, issue.number) },
                div('This will create a branch in GitHub for you to solve this issue.'),
                advanced_box,
                br(),
                submit({ 'class': 'green' }, 'Create Issue Branch'),
                div({ style: 'text-align: right; font-size: 11px' }, '(', a({ id: 'advanced-button', href: curry(toggle_visibility, advanced_box) }, 'advanced'), ')')
              )
            );
          }
        });
      }
    } else {
      render({ into: developer_div },
        info_message("To start working on a solution, link your GitHub account with BountySource."),
        Github.link_requiring_auth({ scope: 'public_repo' }, 'Link GitHub Account')
      );
    }

    return div({ style: 'background: #f1f1f1; padding: 0 21px 21px 21px; margin: 20px 15px; border-bottom: 1px solid #e3e3e3;' },
      ribbon_header("Developers"),
      br(),
      developer_div
    );
  });
  
  define('misc_box', function(issue) {
    return div({ style: 'background: #e8f6f5; margin: 20px 15px'}, 
      h3('Fields'),
      div("Owner: ", issue.owner),
      div("Has code: ", issue.code ? 'Yes' : 'No'),
      issue.labels && issue.labels.length > 0 && div("Labels: ", ul(issue.labels))
    );
  });

  define('create_solution', function(login, repository, issue_number, form_data) {
    hide('developer-box');
    render_message(info_message(
      h1('This will take a moment...'),
      p("We are forking the repository (if necessary), and creating a branch for you to work on.")
    ));

    Github.require_permissions('public_repo', function(authorized, auth_url) {
      if (!authorized) {
        save_route_for_redirect();
        window.location.href = auth_url;
      } else {
        BountySource.create_solution(login, repository, issue_number, form_data.branch_name, function(response) {
          show('developer-box');

          if (response.meta.success) {
            set_route('#repos/'+login+'/'+repository+'/issues/'+issue_number+'/issue_branch');
          } else {
            // precondition failed. need to rebase the forked master branch.
            if (response.meta.status == 412) {
              render_message(
                error_message(response.data.error, ' Follow the instructions below to sync your master branch, after which you can begin working on a solution.'),

                h3('Syncing Your Master Branch'),
                p('To start working on this issue, you need to sync your repository with the original. This minimizes conflicts when you want to submit your solution, making your life much easier.'),
                p('Navigate to your repository, and run the following commands:'),
                code(
                  'git checkout master',
                  'git pull https://github.com/'+login+'/'+repository+'.git master',
                  'git push'
                )
              );
            } else {
              render_message(error_message(response.data.error));
            }
          }
        });
      }
    });
  });

  define('create_bounty', function(login, repository, issue, form_data) {
    var payment_method = form_data.payment_method;
    var amount = form_data.amount;

    BountySource.create_bounty(login, repository, issue, amount, payment_method, window.location.href+'/contributions/receipt', function(response) {
      if (response.meta.success) {
        if (!logged_in()) {
          // save the route to redirect to after account creation/login
          save_route_for_redirect(response.data.redirect_url);
          set_route('#create_account');
        } else {
          if (payment_method == 'personal') BountySource.set_cached_user_info(null);
          window.location.href = response.data.redirect_url;
        }
      } else {
        render({ target: 'create-bounty-errors' }, error_message(response.data.error));
      }
    });
  });
}
