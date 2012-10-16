with (scope('Contributions', 'App')) {
  route('#contributions', function() {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'Account',
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
              th('Issue'),
              th('Issue Status'),
              th('Bounty Amount'),
              th('Date')
            ),

            (user_info.bounties||[]).map(function(bounty) {
              return tr({ style: 'height: 75px;' },
                td({ style: 'width: 60px; text-align: center; vertical-align: middle;' },
                  img({ src: bounty.repository.user.avatar_url, style: 'width: 50px;' })
                ),
                td(bounty.repository.full_name),
                td(a({ href: Issue.get_href(bounty.issue) }, '#'+bounty.issue.number )),
                td(bounty.issue.state),
                td(money(bounty.amount)),
                td(date(bounty.created_at))
              )
            })
          )
        );
      }
    });
  });
}