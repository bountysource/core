with (scope('IssueBranch', 'App')) {
  route('#issue_branches', function() {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#bounties' }, 'All Projects'),
        'Issue Branches'
      ),
      target_div
    );

    BountySource.user_info(function(response) {
      var info = response.data;

      if (info.solutions.length <= 0) {
        render({ into: target_div },
          info_message("You have not started work on any issue branches yet. ", a({ href: '#bounties' }, "Find something to work on."))
        );
      } else {
        render({ into: target_div },
          table(
            tr(
              th('Issue'),
              th('Base Repository'),
              th('Head Repository'),
              th('Head Branch'),
              th('Submitted'),
              th('Merged'),
              th('Actions')
            ),

            info.solutions.map(function(s) {
              return tr(
                td(a({ href: Issue.get_href(s.issue) }, '#'+s.issue.number)),
                td(a({ href: Repository.get_href(s.base.repository) }, s.base.repository.full_name)),
                td(s.head.repository.full_name),
                td(s.head.name),
                td(!!s.pull_request+''),
                td(!!(s.pull_request && s.pull_request.merged)+''),

                // show View Submission or View Issue Branch, depending on whether or not the solution has been
                // submitted as a pull request
                td(div({ style: 'margin: 10px 0px;' }, s.pull_request ? a({ 'class': 'blue', href: IssueBranch.get_href(s) }, 'View Submission') : a({ 'class': 'green', href: IssueBranch.get_href(s) }, 'View Issue Branch')))
              );
            })
          )
        )
      }
    });
  });
};