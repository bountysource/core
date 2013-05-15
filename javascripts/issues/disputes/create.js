with (scope('Disputes', 'App')) {

  route('#issues/:issue_id/solutions/:solution_id/disputes/create', function(issue_id, solution_id) {

    var target_div = div('Loading...');

    render(target_div);

    Bountysource.api('/issues/' + issue_id + '/solutions/' + solution_id + '/', function(response) {

      if (response.meta.success) {
        var solution  = response.data;
        var issue     = solution.issue;

        render({ into: target_div },
          breadcrumbs(
            a({ href: '#' }, 'Home'),
            a({ href: '#trackers/' + issue.tracker.slug }, issue.tracker.name),
            a({ href: issue.frontend_path }, truncate(issue.title,40)),
            'File Dispute'
          ),

          Columns.create(),

          Columns.main(
            dl(
              dt(
                h4(a({ href: issue.url, target: '_blank' }, 'Issue'))
              ),
              dd(issue.title),

              dt(
                h4(a({ href: solution.code_url, target: '_blank' }, 'Solution #' + solution.number))
              ),
              dd(solution.body)
            ),

            form({ 'class': 'fancy', action: curry(file_dispute, solution) },
              div({ id: 'file-dispute-alerts' }),

              fieldset(
                textarea({
                  id: 'body',
                  name: 'body',
                  placeholder: 'Description of why Solution # ' + solution.number + ' should not be accepted',
                  style: 'width: 638px; height: 150px;'
                })
              ),

              fieldset(
                submit({ 'class': 'button blue' }, 'File Dispute')
              )
            )
          ),

          Columns.side(
            h4('Disputes'),
            p("File a dispute against this Solution if it does not resolve the underlying Issue."),
            p("Disputed Solutions will not be accepted until all open disputes are resolved."),
            p("Disputes should be resolved by the Developer who submitted the Solution, and the Backers of the Issue."),
            p("Bountysource will always have the final say in whether or not a Dispute is resolved.")
          )
        )
      } else {
        render({ into: target_div }, error_message(response.data.error));
      }

    });

  });

  define('file_dispute', function(solution, form_data) {
    if (confirm("Are you sure?")) {
      Bountysource.api('/issues/' + solution.issue.id + '/solutions/' + solution.id + '/disputes', 'POST', form_data, function(response) {

        console.log(response);

        if (response.meta.success) {
          var dispute = response.data;
          var issue = dispute.solution.issue;

          set_route(issue.frontend_path);
        } else {
          render({ target: 'file-dispute-alerts' }, error_message(response.data.error));
        }
      });
    }
  });

}