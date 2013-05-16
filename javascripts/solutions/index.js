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

    Bountysource.get_solutions(function(response) {
      if (response.meta.success) {
        var solutions = response.data;

        if (solutions.length <= 0) {
          render({ into: target_div },
            info_message("You have not started work on any issue branches yet. ", a({ href: '#' }, "Find something to work on!"))
          );
        } else {
          render({ into: target_div },
            table({ id: 'solutions-table' },
              tr({ id: 'solutions-table-head' },
                th('Issue'),
                th({ style: 'text-align: center; '}, 'Solution Status')
              ),
              solutions.map(solution_row)
            )
          );
        }
      } else {
        render({ into: target_div }, error_message(response.data.error));
      }
    });
  });

  define('solution_row', function(solution) {
    return tr({ 'class': 'solution-row', onClick: curry(set_route, solution.accepted ? solution.frontend_path : solution.frontend_path) },
      td(a({ href: solution.issue.frontend_path }, truncate(solution.issue.title, 60))),
      td({ style: 'text-align: center; '}, status_element(solution))
    );
  });

}
