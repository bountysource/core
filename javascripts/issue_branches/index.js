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
              th(),
              th('Project'),
              th({ style: 'width: 60px;' }, 'Issue'),
              th({ style: 'width: 200px;' }),
              th({ style: 'text-align: center; width: 200px' }, 'Issue Branch Status'),
              th()
            ),

            info.solutions.map(function(issue_branch) {
              return tr(
                td({ style: 'width: 60px; text-align: center; vertical-align: middle;' },
                  img({ style: 'width: 50px;', src: issue_branch.base.repository.user.avatar_url })
                ),
                td(a({ href: Repository.get_href(issue_branch.base.repository) }, issue_branch.base.repository.full_name)),
                td(a({ href: Issue.get_href(issue_branch.issue) }, '#'+issue_branch.issue.number)),
                td({ style: 'color: #888;' }, issue_branch.issue.title),
                td({ style: 'text-align: center;' }, IssueBranch.status_element(issue_branch)),

                // show View Submission or View Issue Branch, depending on whether or not the solution has been
                // submitted as a pull request
                td(div({ style: 'margin: 10px 0px;' }, issue_branch.pull_request ? a({ 'class': 'blue', href: IssueBranch.get_href(issue_branch) }, 'View Submission') : a({ 'class': 'green', href: IssueBranch.get_href(issue_branch) }, 'View Issue Branch')))
              );
            })
          )
        )
      }
    });
  });
};