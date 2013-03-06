with (scope('Show','Solution')) {
  route('#solutions/:id', function(id) {
    Show.error_message_container          = div();
    Show.submit_solution_errors_container = div(),
    Show.update_solution_errors_container = div({ style: 'width: 525px;' }),
    Show.target_div                       = div('Loading...');

    var breadrcrumbs_div = div(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'Loading...'
      ),
      Show.error_message_container,
      Show.target_div
    );

    render(breadrcrumbs_div, Show.target_div);

    BountySource.get_solution(id, function(response) {
      if (response.meta.success) {
        var solution = response.data;

        // cache the solution
        Show.solution = solution;

        // fill in the breadcrumbs
        render({ into: breadrcrumbs_div },
          breadcrumbs(
            a({ href: '#' }, 'Home'),
            a({ href: '#solutions' }, 'My Solutions'),
            truncate(solution.issue.title, 70)
          )
        );

        if (solution.accepted) {
          render({ into: Show.target_div }, Payout.page_for_solution(solution));
        } else if (solution.submitted) {
          render({ into: Show.target_div },
            h2('Solution Submitted!'),
            p("Awesome, we have received your proposed solution for this issue, and will keep track of its status."),

            h3("Now what?"),
            p("The following needs to happen before you earn the bounty:"),
            ol(
              li("Your solution must be merged into the project by the committers"),
              li("Your solution must have no outstanding disputes by any of the backers after ", strong(formatted_date(solution.dispute_period_end_date)))
            ),

            h3("Update your submission"),
            form({ 'class': 'fancy', action: update_solution },
              fieldset({ 'class': 'no-label' },
                Show.update_solution_errors_container
              ),
              fieldset({ 'for': 'code_url' },
                label('Code URL:'),
                url({
                  required: true,
                  name: 'code_url',
                  placeholder: 'https://github.com/bountysource/frontend/pull/2',
                  style: 'width: 500px; font-size: 14px;',
                  value: solution.code_url||''
                })
              ),
              fieldset({ 'for': 'body' },
                label('Submission Message:'),
                textarea({ required: true, name: 'body', placeholder: 'Removed X from Y, and refactored Z', style: 'width: 500px; height: 150px;' },
                  solution.body
                )
              ),
              fieldset({ 'class': 'no-label' },
                submit({ 'class': 'green' }, 'Update')
              )
            )
          );
        } else {
          var code_url_input = url({ required: true, name: 'code_url', placeholder: 'https://github.com/bountysource/frontend/pull/2', style: 'width: 500px; font-size: 14px;' });
          var body_input = textarea({ required: true, name: 'body', placeholder: 'Removed X from Y, and refactored Z', style: 'width: 500px; height: 150px;' });

          code_url_input.addEventListener('blur', update_solution_event_callback);
          body_input.addEventListener('blur', update_solution_event_callback);

          render({ into: Show.target_div },
            h2('Started a Solution'),
            p("You have started working on a solution to \"", a({ href: solution.issue.frontend_path }, solution.issue.title), '"'),
            p("When you are finished with your solution, fill in the form below so that we can track its progress."),

            form({ 'class': 'fancy', action: submit_solution },
              fieldset({ 'for': 'code_url' },
                label('Code URL:'),
                code_url_input
              ),
              fieldset({ 'for': 'body' },
                label('Submission Message:'),
                body_input
              ),
              fieldset({ 'class': 'no-label' },
                submit({ 'class': 'blue' }, 'Submit Code'),
                a({ 'class': 'gray', href: destroy_solution, style: 'display: inline-block; vertical-align: middle; width: 200px; margin-left: 10px;' }, 'Stop Work')
              )
            )
          );
        }
      } else {
        render({ into: Show.target_div }, '');
        render({ into: Show.error_message_container }, error_message(response.data.error));
      }
    })
  });

  define('update_solution_event_callback', function() {
    var request_data = {};
    request_data[this.getAttribute('name')] = this.value;
    BountySource.update_solution(Show.solution.id, request_data, function(response) {
      if (!response.meta.success) {
        render({ into: Show.submit_solution_errors_container }, error_message(response.data.error));
      }
    });
  });

  define('submit_solution', function() {
    render({ into: Show.submit_solution_errors_container }, '');

    BountySource.submit_solution(Show.solution.id, function(response) {
      if (response.meta.success) {
        set_route(get_route());
      } else {
        render({ into: Show.submit_solution_errors_container }, error_message(response.data.error));
      }
    });
  });

  define('destroy_solution', function() {
    render({ into: Show.submit_solution_errors_container }, '');

    BountySource.destroy_solution(Show.solution.id, function(response) {
      if (response.meta.success) {
        set_route(Show.solution.issue.frontend_path);
      } else {
        render({ into: Show.submit_solution_errors_container }, errors_message(response.data.error));
      }
    })
  });

  define('update_solution', function(form_data) {
    render({ into: Show.update_solution_errors_container },'');

    BountySource.update_solution(Show.solution.id, form_data, function(response) {
      if (response.meta.success) {
        // update the cached solution model
        Show.solution = response.data;

        render({ into: Show.update_solution_errors_container }, small_success_message("Solution updated!"));
      } else {
        render({ into: Show.update_solution_errors_container }, small_error_message(response.data.error));
      }
    })
  });


}
