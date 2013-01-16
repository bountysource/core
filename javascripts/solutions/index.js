with (scope('Solution', 'App')) {
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

    BountySource.get_solutions(function(response) {
      var solutions = response.data;

      if (solutions.length <= 0) {
        render({ into: target_div },
          info_message("You have not started work on any issue branches yet. ", a({ href: '#bounties' }, "Find something to work on."))
        );
      } else {
        render({ into: target_div },
          table({ 'class': 'solutions' },
            tr(
              th({ style: 'width: 60px;'}),
              th({ style: 'width: 120px;' }, 'Project'),
              th('Issue'),
              th({ style: 'text-align: center; width: 250px' }, 'Solution Status')
            ),

            solutions.map(function(solution) {
              return tr({ 'class': 'link', onClick: function() { set_route('#solutions/'+solution.id) } },
                td(img({ src: solution.issue.repository.owner.avatar_url, style: 'width: 50px; border-radius: 3px;' })),
                td(a({ href: Repository.get_href(solution.issue.repository) }, solution.issue.repository.full_name)),
                td(a({ href: Issue.get_href(solution.issue) }, abbreviated_text(solution.issue.title, 100))),
                td({ style: 'text-align: center;' }, status_element(solution))
              )
            })
          )
        )
      }
    });
  });
};