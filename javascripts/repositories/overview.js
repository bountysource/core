with (scope('Repository')) {

  route('#trackers/:tracker_id', function(tracker_id) {
    var target_div = div('Loading...');

    render(target_div);

    BountySource.get_repository_overview(tracker_id, function(response) {
      if (!response.meta.success) return render({ into: target_div }, response.data.error || response.data.message);

      var repo = response.data;

      App.update_facebook_like_button({
        name:         repo.name,
        caption:      repo.description,
        description:  "BountySource is the funding platform for open-source software. Place a bounty on issues you want resolved, or submit pull requests to collect open bounties!",
        picture:      repo.image_url
      });

      render({ into: target_div },

        breadcrumbs(
          a({ href: '#' }, 'Home'),
          repo.name
        ),

        Columns.create(),

        Columns.main(
          section(
            img({ src: repo.image_url, style: 'width: 75px; height: 75px; vertical-align: middle; margin-right: 10px; float: left'}),
            h2({ style: 'margin: 0 0 10px 0' }, repo.name),
            repo.description && span(repo.description),
            div({ style: 'clear: both' })
          ),

          issue_table({ header_class: 'thick-line-green' }, "Largest Bounties", repo.issues_valuable),
          issue_table({ header_class: 'thick-line-green' }, "Featured", repo.issues_featured),
          issue_table({ header_class: 'thick-line-blue' }, "Popular", repo.issues_popular),
          issue_table({ header_class: 'thick-line-orange' }, "Most Recent", repo.issues_newest),

          div(
            div({ style: 'margin-top: 20px; width: 150px; float: left; padding-right: 20px' }, a({ 'class': 'blue', href: Repository.get_issues_href(repo) }, 'View All Issues')),
            // div({ style: 'margin-top: 20px; width: 180px; float: left;' }, a({ 'class': 'blue', href: '#repos/'+repo.full_name+'/donate'}, 'Donate to Project')),
            div({ style: 'clear: both '})
          )
        ),

        Columns.side(
          div({ 'class': 'stats', style: 'width: 150px; padding: 10px; margin: 20px auto auto auto;' },
            repo.bounty_total && div(
              h2(money(repo.bounty_total)),
              h3({ 'class': 'orange-line' }, 'Active Bounties')
            ),

            repo.watchers && [
              h2(formatted_number(repo.watchers)),
              h3({ 'class': 'blue-line' }, 'Followers')
            ],


            repo.forks && [
              h2(formatted_number(repo.forks)),
              h3({ 'class': 'blue-line' }, 'Forks')
            ],

            repo.bounteous_issues_count && div(
              h2(formatted_number(repo.bounteous_issues_count)),
              h3({ 'class': 'blue-line' }, 'Issues with Bounties')
            )
          )
        )
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
              td({ style: 'vertical-align: middle;' }, a({ href: Repository.get_href(issue.tracker), title: issue.tracker.name }, img({ src: issue.tracker.image_url, style: 'width: 30px; border-radius: 3px; margin: 0 5px;' }) ))
            );
          }

          row_data.push(
            issue.number && td({ style: 'padding-right: 10px' }, a({ href: Issue.get_href(issue), style: 'color: #93979a' }, '#' + issue.number)),
            td({ style: 'width: 100%' }, a({ href: Issue.get_href(issue) }, issue.title)),
            //td({ style: 'text-align: right; color: #7cc5e3; white-space: nowrap' }, issue.solutions > 0 && [issue.solutions, ' ', img({ style: 'vertical-align: middle', src: 'images/icon-developer.png' })]),
            td({ style: 'text-align: right; color: #d8a135; white-space: nowrap' }, issue.comment_count > 0 && [issue.comment_count, ' ', img({ style: 'vertical-align: middle', src: 'images/icon-comments.png' })]),
            td({ style: 'text-align: right; white-space' }, issue.bounty_total > 0 && span({ style: 'background: #83d11a; border-radius: 2px; padding: 3px; color: white' }, money(issue.bounty_total)))
          );

          return tr(row_data);
        })
      )
    );
  });


//  route('#repos/:login/:repository/donate', function(login, repository) {
//
//    var target_div = div('Loading...');
//
//    render(
//      breadcrumbs(
//        a({ href: '#' }, 'Home'),
//        a({ href: '#repos/'+login+'/'+repository }, login + '/' + repository),
//        "Donate"
//      ),
//
//      target_div
//    );
//
//    BountySource.get_repository_overview(login, repository, function(response) {
//      if (!response.meta.success) return render({ into: target_div }, response.data.error || response.data.message);
//
//      var repo = response.data;
//      render({ into: target_div },
//        div({ 'class': 'split-main' },
//          section({ id: 'faq' },
//            dl(
//              dt("Why should I donate?"),
//              dd("When you donate to a project, you are making sure your money gets allocated to the project's most important issues."),
//
//              dt("Who gets this money?"),
//              dd("The project's committers control all donations."),
//
//              dt("What can they do with it?"),
//              dd("Committers use project donations to create bounties on issues within their own project.")
//            )
//          )
//        ),
//        div({ 'class': 'split-side' },
//          donation_box(repo)
//        ),
//        div({ 'class': 'split-end' })
//      );
//    });
//  });
//
//  define('donation_box', function(repo) {
//    var payment_box_div = Payment.payment_box('Donation', repo, null, BountySource.www_host+Repository.get_href(repo));
//
//    return div({ id: 'bounty-box' },
//      div({ style: 'padding: 0 21px' }, ribbon_header("Donate to Project")),
//
//      repo.account_balance > 0 && section(
//        div({ 'class': 'total_bounties' }, money(repo.account_balance)),
//        div({ style: 'text-align: center' }, "From ", repo.bounties.length, " backer" + (repo.bounties.length == 1 ? '' : 's') + ".")
//      ),
//      payment_box_div
//    );
//  });

}
