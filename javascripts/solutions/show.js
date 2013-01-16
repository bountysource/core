with (scope('Solution', 'App')) {
  route('#solutions/:solution_id', function(solution_id) {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#solutions' }, 'My Solutions'),
        span({ id: 'solution-title' }, 'Loading...')
      ),
      target_div
    );

    BountySource.get_solution(solution_id, function(response) {
      if (response.meta.success) {
        var solution = response.data;

        render({ target: 'solution-title' }, solution.issue.title);

        render({ into: target_div },
          div({ 'class': 'split-main'},
            Solution.solution_status_box(solution),

            table(
              tr({ style: 'height: 40px;' },
                td('Issue Status:'),
                td({ style: 'text-align: center;' }, Issue.status_element(solution.issue))
              ),
              tr({ style: 'height: 40px;' },
                td('Solution Status:'),
                td({ style: 'text-align: center;' }, Solution.status_element(solution))
              )
            )
          ),

          div({ 'class': 'split-side'},
            Issue.card(solution.issue, { show_share_buttons: true })
          ),

          div({ 'class': 'split-end'})
        );
      } else {
        render({ into: target_div }, response.data.error);
      }
    });
  });

  // landing page for code submission
  route('#solutions/:solution_id/receipt', function(solution_id) {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#solutions' }, 'My Solutions'),
        span({ id: 'solution-title' }, 'Loading...'),
        'Solution Received!'
      ),
      target_div
    );

    BountySource.get_solution(solution_id, function(response) {
      if (response.meta.success) {
        var solution = response.data;

        console.log(solution);

        render({ target: 'solution-title' }, a({ href: Solution.get_href(solution) }, solution.issue.title));

        render({ into: target_div },
          div({ 'class': 'split-main'},
            h2('Solution Submitted!'),
            p("You will be able to claim the bounty when your pull request is merged, and the underling issue is closed.")
          ),

          div({ 'class': 'split-side'},
            Issue.card(solution.issue, { show_share_buttons: true })
          ),

          div({ 'class': 'split-end'})
        );
      } else {
        render({ into: target_div }, error_message(response.data.error));
      }
    });
  });

}
