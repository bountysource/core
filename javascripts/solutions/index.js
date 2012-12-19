with (scope('IssueBranch', 'App')) {
  route('#solutions', function() {
    if (require_login()) return false;

    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'My Solutions'
      ),
      target_div
    );

    BountySource.user_info(function(response) {
      var info = response.data;

      console.log(info.solutions);

      if (info.solutions.length <= 0) {
        render({ into: target_div },
          info_message("You have not started work on any issue branches yet. ", a({ href: '#bounties' }, "Find something to work on."))
        );
      } else {
        render({ into: target_div },
          table(
            tr(
              th({ style: 'width: 60px;'}),
              th('Project'),
              th({ style: 'width: 55%' }, 'Issue'),
              th({ style: 'text-align: center; width: 20%;' }, 'Pull Request Status'),
              th()
            ),

            info.solutions.map(function(solution) {
              return tr(
                td(img({ src: solution.issue.repository.owner.avatar_url, style: 'width: 50px; border-radius: 3px;' })),
                td(a({ href: Repository.get_href(solution.issue.repository) }, solution.issue.repository.full_name)),
                td(a({ href: Issue.get_href(solution.issue) }, abbreviated_text(solution.issue.title, 100))),
                td({ style: 'text-align: center;' }, solution.pull_request.merged ? 'Merged' : 'Pending Merge')
              )
            })
          )
        )
      }
    });
  });
};