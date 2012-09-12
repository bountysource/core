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
      console.log(repo);
      render({ into: target_div },
        div({ style: 'float: left; width: 735px; margin-right: 30px' },
          h1(repo.full_name),
          div("description: ", repo.description),
          div("logo: ", repo.logo_url),
        
          div("all issues: ", a({ href: '#repos/'+repo.full_name+'/issues'}, 'List All Issues')),
          div("total bountuy: ", money(repo.total_bounty)),
          div("followers: ", repo.followers),
          div("forks: ", repo.forks),
        
          issue_table({ header_class: 'thick-line-green' }, "Featured", repo.issues_featured),
          issue_table({ header_class: 'thick-line-blue' }, "Popular", repo.issues_popular),
          issue_table({ header_class: 'thick-line-orange' }, "Most Worked on", repo.issues_most_developers)
        ),
        div({ style: 'float: left; width: 170px' }, 
          div({ 'class': 'stats', style: 'width: 150px; padding: 10px' },
            h2(repo.followers),
            h3({ 'class': 'blue-line' }, 'Followers'),

            h2(repo.forks),
            h3({ 'class': 'blue-line' }, 'Forks'),

            h2('400'),
            h3({ 'class': 'blue-line' }, 'Open Contests'),

            h2('$2,000'),
            h3({ 'class': 'orange-line' }, 'Active Bounties'),

            h2('$4,000'),
            h3({ 'class': 'green-line' }, 'Payout Last Month')
          ),
          
          div("committers: ", ul(repo.committers.map(function(commiter) { return li(commiter) })))        
        ),
        div({ style: 'clear: both' })
      );
    });
  });
  
  define('issue_table', function(options, title, issues) {
    if (!issues || issues.length == 0) return;
    
    return section({ 'class': 'issue-table' },
      h2({ 'class': options.header_class }, title),
      table(
        issues.map(function(issue) {
          return tr(
            td({ style: 'text-align: right' }, a({ href: '#repos'+issue.repository_full_name+'/issues/'+issue.number, style: 'color: #93979a' }, '#' + issue.number)),
            td({ style: 'width: 100%' }, a({ href: '#repos'+issue.repository_full_name+'/issues/'+issue.number }, issue.title)),
            td({ style: 'text-align: right; color: #7cc5e3; white-space: nowrap' }, issue.solutions > 0 && [issue.solutions, ' ', img({ style: 'vertical-align: middle', src: 'images/icon-developers.png' })]),
            td({ style: 'text-align: right; color: #d8a135; white-space: nowrap' }, issue.comments > 0 && [issue.comments, ' ', img({ style: 'vertical-align: middle', src: 'images/icon-comments.png' })]),
            td({ style: 'text-align: right; white-space' }, issue.bounties > 0 && span({ style: 'background: #83d11a; border-radius: 2px; padding: 3px; color: white' }, money(issue.bounties)))
          );
        })
      )
    );
  });

}