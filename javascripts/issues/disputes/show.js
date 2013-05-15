with (scope('Disputes', 'App')) {

  route('#issues/:issue_id/solutions/:solution_id/disputes/:dispute_number', function(issue_id, solution_id, dispute_number) {
    var target_div = div('Loading...');

    render(target_div);

    Bountysource.api('/issues/'+issue_id+'/solutions/'+solution_id+'/disputes/'+dispute_number, function(response) {
      if (response.meta.success) {
        var dispute = response.data;
        var issue   = dispute.solution.issue;

        render({ into: target_div },
          breadcrumbs(
            a({ href: '#' }, 'Home'),
            a({ href: issue.tracker.frontend_path }, issue.tracker.name),
            a({ href: issue.frontend_path }, truncate(issue.title,40)),
            'Disputes',
            '#'+dispute.number
          ),

          h3('Dispute #' + dispute.number),

          div({ style: 'padding: 10px 20px;' },
            '"' + dispute.body + '"',

            p('Filed by ', a({ href: dispute.person.frontend_path }, dispute.person.display_name))
          ),

          a({ href: issue.url, target: '_blank' }, 'Join the discussion regarding this dispute')
        );
      } else {
        render({ into: target_div }, error_message(response.data.error));
      }
    });
  });

}