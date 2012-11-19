with (scope('Repository')) {

  route('#repos/:login/:repository', function(login, repository) {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        (login + '/' + repository)
      ),

      target_div
    );

    BountySource.get_repository_overview(login, repository, function(response) {
      if (!response.meta.success) return render({ into: target_div }, response.data.error || response.data.message);

      var repo = response.data;
      render({ into: target_div },
        div({ 'class': 'split-main' },
          section(
            img({ src: repo.owner.avatar_url, style: 'width: 75px; height: 75px; vertical-align: middle; margin-right: 10px; float: left'}),
            h2({ style: 'margin: 0 0 10px 0' }, repo.owner.login),
            repo.owner.login != repo.name && h2({ style: 'margin: 0 0 10px 0' }, repo.name),
            repo.description && span(repo.description),
            div({ style: 'clear: both' })
          ),

          issue_table({ header_class: 'thick-line-green' }, "Largest Bounties", repo.issues_most_bounteous),
          issue_table({ header_class: 'thick-line-green' }, "Featured", repo.issues_featured),
          issue_table({ header_class: 'thick-line-blue' }, "Popular", repo.issues_popular),
          issue_table({ header_class: 'thick-line-orange' }, "Most Recent", repo.issues_most_recent),
          
          div(
            repo.has_issues && div({ style: 'margin-top: 20px; width: 150px; float: left; padding-right: 20px' }, a({ 'class': 'blue', href: Repository.get_issues_href(repo) }, 'View All Issues')),
            div({ style: 'margin-top: 20px; width: 180px; float: left;' }, a({ 'class': 'blue', href: '#repos/'+repo.full_name+'/donate'}, 'Donate to Project')),
            div({ style: 'clear: both '}),
            !repo.has_issues && div({ style: 'margin-top: 1em;' },
                                    "This repository has issues disabled.")
          )
        ),
        div({ 'class': 'split-side' },

          div({ 'class': 'stats', style: 'width: 150px; padding: 10px; margin: 20px auto auto auto;' },
            h2(money(repo.bounty_total)),
            h3({ 'class': 'orange-line' }, 'Active Bounties'),

            h2(formatted_number(repo.followers)),
            h3({ 'class': 'blue-line' }, 'Followers'),


            h2(formatted_number(repo.forks)),
            h3({ 'class': 'blue-line' }, 'Forks'),

            repo.has_issues && h2(formatted_number(repo.bounteous_issues_count)),
            repo.has_issues && h3({ 'class': 'blue-line' }, 'Issues with Bounties'),

            // TODO: this isn't correct since the account can be withdrawn from
            // TODO: add a total_donations column
            h2(money(repo.account_balance)),
            h3({ 'class': 'blue-line' }, 'Donations')

//            h2('$999'),
//            h3({ 'class': 'green-line' }, 'Payout Last Month')
          )
          
//          repo.committers && div({ style: 'background: #dff7cb; padding: 10px; margin-top: 20px' },
//            h2({ style: 'color: #93a385; text-align: center; font-size: 18px; font-weight: normal; margin: 0 0 10px 0' }, "Committers"),
//            ul({ style: 'margin: 0; padding: 0' }, repo.committers.map(function(commiter) {
//              return li({ style: 'margin: 0 0 5px 0; padding: 0; list-style: none' },
//                img({ src: 'https://a248.e.akamai.net/assets.github.com/images/gravatars/gravatar-user-420.png', style: 'width: 32px; height: 32px; vertical-align: middle; margin-right: 10px' }),
//                commiter
//              );
//            }))
//          )

        ),
        div({ 'class': 'split-end' })
      );
    });
  });
  
  define('issue_table', function(options, title, issues) {
    if (!issues || issues.length == 0) return;
    return section({ 'class': 'issue-table' },
      h2({ 'class': options.header_class }, title),
      table(
        issues.map(function(issue) {
          var row_data = [];

          if (options.show_repository) {
            row_data.push(
              td({ style: 'vertical-align: middle;' }, a({ href: Repository.get_href(issue.repository), title: issue.repository.display_name }, img({ src: issue.repository.user.avatar_url, style: 'width: 30px; border-radius: 3px; margin: 0 5px;' }) ))
            );
          }

          row_data.push(
            td({ style: 'padding-right: 10px' }, a({ href: Issue.get_href(issue), style: 'color: #93979a' }, '#' + issue.number)),
            td({ style: 'width: 100%' }, a({ href: Issue.get_href(issue) }, issue.title)),
            td({ style: 'text-align: right; color: #7cc5e3; white-space: nowrap' }, issue.solutions > 0 && [issue.solutions, ' ', img({ style: 'vertical-align: middle', src: 'images/icon-developer.png' })]),
            td({ style: 'text-align: right; color: #d8a135; white-space: nowrap' }, issue.comments > 0 && [issue.comments, ' ', img({ style: 'vertical-align: middle', src: 'images/icon-comments.png' })]),
            td({ style: 'text-align: right; white-space' }, issue.bounty_amount > 0 && span({ style: 'background: #83d11a; border-radius: 2px; padding: 3px; color: white' }, money(issue.bounty_amount)))
          );

          return tr(row_data);
        })
      )
    );
  });


  route('#repos/:login/:repository/donate', function(login, repository) {

    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#repos/'+login+'/'+repository }, login + '/' + repository),
        "Donate"
      ),

      target_div
    );

    BountySource.get_repository_overview(login, repository, function(response) {
      if (!response.meta.success) return render({ into: target_div }, response.data.error || response.data.message);

      var repo = response.data;
      render({ into: target_div },
        div({ 'class': 'split-main' },
          section({ id: 'faq' },
            dl(
              dt("Why should I donate?"),
              dd("When you donate to a project, you are making sure your money gets allocated to the project's most important issues."),

              dt("Who gets this money?"),
              dd("The project's committers control all donations."),

              dt("What can they do with it?"),
              dd("Committers use project donations to create bounties on issues within their own project.")
            )
          )
        ),
        div({ 'class': 'split-side' },
          donation_box(repo)
        ),
        div({ 'class': 'split-end' })
      );
    });
  });

  define('donation_box', function(repo) {
    var payment_box_div = Payment.payment_box('Donation', repo, null, BountySource.www_host+Repository.get_href(repo));

    return div({ id: 'bounty-box' },
      div({ style: 'padding: 0 21px' }, ribbon_header("Donate to Project")),

      repo.account_balance > 0 && section(
        div({ 'class': 'total_bounties' }, money(repo.account_balance)),
        div({ style: 'text-align: center' }, "From ", repo.bounties.length, " backer" + (repo.bounties.length == 1 ? '' : 's') + ".")
      ),
      payment_box_div
    );
  });

}
