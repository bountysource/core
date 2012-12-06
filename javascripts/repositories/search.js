with (scope('Repository', 'App')) {
  route('#repos/search', function() {
    var params = get_params();
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'Search: ' + params.query
      ),

      target_div
    );

    BountySource.search_repositories(params.query, function(response) {
      var repositories = response.data||[];

      render({ into: target_div },
        table(
          tr(
            th(),
            th('Repository'),
            th('Bounties'),
            th('Followers'),
            th('Forks'),
            th('Updated'),
            th('Description')
          ),

          (repositories||[]).map(function(repo) {
            return tr(
              td(a({ href: Repository.get_href(repo) }, img({ src: repo.user.avatar_url, style: 'width: 30px; border-radius: 3px; margin: 0 5px;' }))),
              td({ style: 'width: 200px' }, a({ href: Repository.get_href(repo) }, repo.owner.login+'/'+repo.name)),
              td(money(repo.bounty_total)),
              td(formatted_number(repo.followers)),
              td(formatted_number(repo.forks)),
              td({ style: 'white-space:nowrap' }, (repo.pushed_at||"").substr(0,10)),
              td({ style: 'color: #888' }, p({ style: 'width: 250px; min-height: 10px;' }, repo.description))
            );
          })
        )
      );
    });
  });
};