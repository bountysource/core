with (scope('Repository', 'App')) {

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
      var repo = response.data;
      render({ into: target_div },
        div({ style: 'float: left; width: 735px; margin-right: 30px' },
          section(
            img({ src: repo.owner.avatar_url || 'https://a248.e.akamai.net/assets.github.com/images/gravatars/gravatar-user-420.png', style: 'width: 75px; height: 75px; vertical-align: middle; margin-right: 10px; float: left'}),
            h2({ style: 'margin: 0 0 10px 0' }, repo.owner.login),
            repo.owner != repo.name && h2({ style: 'margin: 0 0 10px 0' }, repo.name),
            repo.description && span(repo.description),
            div({ style: 'clear: both' })
          ),
        
          issue_table({ header_class: 'thick-line-green' }, "Featured", repo.issues_featured, repo),
          issue_table({ header_class: 'thick-line-blue' }, "Popular", repo.issues_popular, repo),
          issue_table({ header_class: 'thick-line-orange' }, "Most Worked on", repo.issues_most_developers, repo),
          
          div({ style: 'margin-top: 20px; width: 150px' }, a({ 'class': 'blue', href: '#repos/'+repo.full_name+'/issues'}, 'View All Issues'))
        ),
        div({ style: 'float: left; width: 170px' }, 
          div({ 'class': 'stats', style: 'width: 150px; padding: 10px' },
            h2(repo.followers),
            h3({ 'class': 'blue-line' }, 'Followers'),

            h2(repo.forks),
            h3({ 'class': 'blue-line' }, 'Forks'),

            h2(''+repo.bounties.length),
            h3({ 'class': 'blue-line' }, 'Open Contests'),

            h2('$'+parseInt(repo.bounties_total)),
            h3({ 'class': 'orange-line' }, 'Active Bounties'),

            h2('$999'),
            h3({ 'class': 'green-line' }, 'Payout Last Month')
          ),
          
          repo.committers && div({ style: 'background: #dff7cb; padding: 10px; margin-top: 20px' },
            h2({ style: 'color: #93a385; text-align: center; font-size: 18px; font-weight: normal; margin: 0 0 10px 0' }, "Committers"),
            ul({ style: 'margin: 0; padding: 0' }, repo.committers.map(function(commiter) { 
              return li({ style: 'margin: 0 0 5px 0; padding: 0; list-style: none' },
                img({ src: 'https://a248.e.akamai.net/assets.github.com/images/gravatars/gravatar-user-420.png', style: 'width: 32px; height: 32px; vertical-align: middle; margin-right: 10px' }), 
                commiter
              );
            }))
          )
        ),
        div({ style: 'clear: both' })
      );
    });
  });
  
  define('issue_table', function(options, title, issues, repo) {
    if (!issues || issues.length == 0) return;
    return section({ 'class': 'issue-table' },
      h2({ 'class': options.header_class }, title),
      table(
        issues.map(function(issue) {
          return tr(
            td({ style: 'padding-right: 10px' }, a({ href: '#repos/'+repo.full_name+'/issues/'+issue.number, style: 'color: #93979a' }, '#' + issue.number)),
            td({ style: 'width: 100%' }, a({ href: '#repos/'+repo.full_name+'/issues/'+issue.number }, issue.title)),
            td({ style: 'text-align: right; color: #7cc5e3; white-space: nowrap' }, issue.solutions > 0 && [issue.solutions, ' ', img({ style: 'vertical-align: middle', src: 'images/icon-developer.png' })]),
            td({ style: 'text-align: right; color: #d8a135; white-space: nowrap' }, issue.comments > 0 && [issue.comments, ' ', img({ style: 'vertical-align: middle', src: 'images/icon-comments.png' })]),
            td({ style: 'text-align: right; white-space' }, repo.bounties_total > 0 && span({ style: 'background: #83d11a; border-radius: 2px; padding: 3px; color: white' }, money(repo.bounties_total)))
          );
        })
      )
    );
  });

}