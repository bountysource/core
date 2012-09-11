with (scope('Repository', 'App')) {
  route('#repos/search/:term', function(term) {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a('Projects')
      ),

      target_div
    );

    BountySource.search_repositories(term, function(response) {
      var repositories = response.data||[];

      render({ into: target_div },
        table(
          tr(
            th('Repository'),
            th('Bounties'),
            th('Followers'),
            th('Forks'),
            th('Updated'),
            th('Description')
          ),

          (repositories||[]).map(function(repo) {
            return tr(
              td({ style: 'width: 200px' }, a({ href: '#repos/'+repo.owner+'/'+repo.name+'/issues' }, repo.owner+'/'+repo.name)),
              td('$'+repo.total_bounty),
              td(repo.followers),
              td(repo.forks),
              td({ style: 'white-space:nowrap' }, (repo.pushed_at||"").substr(0,10)),
              td({ style: 'color: #888' }, repo.description)
            );
          })
        )
      );
    });
  });
};