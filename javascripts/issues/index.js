with (scope('Issue', 'App')) {

  route('#repos/:login/:repository/issues', function(login, repository) {
    var target_div = div('Loading...');

    if (!repository.has_issues) {
      set_route('#repos/'+login+'/'+repository);
      return;
    }

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#repos/'+login+'/'+repository }, login + '/' + repository),
        "Issues"
      ),

      target_div
    );

    BountySource.get_issues(login, repository, function(response) {
      if (response.data && response.data.error) {
        render({ into: target_div },
          div(response.data.error)
        );
      } else {
        var issues = response.data||[];

        render({ into: target_div },
          Repository.issue_table({ header_class: 'thick-line-green' }, 'All Issues', issues)
          // 
          // table(
          //   tr(
          //     th('ID'),
          //     th('Title'),
          //     th('Bounties'),
          //     th('Code'),
          //     th('Comments'),
          //     th('State'),
          //     th('Updated')
          //   ),
          // 
          //   (issues||[]).map(function(issue) {
          //     return tr(
          //       td(issue.number),
          //       td(a({ href: '#repos/'+login+'/'+repository+'/issues/'+issue.number }, issue.title)),
          //       td(money(issue.account_balance)),
          //       td(issue.code ? '✔' : ''),
          //       td(issue.comments),
          //       td(issue.state),
          //       td({ style: 'white-space:nowrap' }, (issue.updated_at||"").substr(0,10))
          //     )
          //   })
          // )
        );
      }
    });
  });

}
