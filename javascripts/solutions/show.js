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

        if (solution.accepted && !solution.disputed && !solution.in_dispute_period) {
          render({ into: target_div },
            h2('Solution Accepted!'),
            p("Congratulations, your solution has been accepted and merged into the project!"),
            a({ 'class': 'green pledge-button', style: 'width: 250px;', href: '#solutions/'+solution.id+'/payout' }, 'Claim Bounty')
          );
        } else {
          render({ into: target_div },
            div({ 'class': 'split-main'},
              status_description(solution),

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
        }
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

  define('facebook_share_solution_url', function(solution) {
    return Facebook.share_dialog_url({
      link:         encode_html(BountySource.www_host+'#repos/'+solution.issue.repository.full_name+'/issues/'+solution.issue.number),
      title:        ("I submitted a solution to " + solution.issue.repository.full_name + " on BountySource."),
      description:  ("If my solution is accepted I will claim the bounty, which is currently at " + money(solution.issue.bounty_total) + ".")
    });
  });

  define('twitter_share_solution_url', function(solution) {
    return Twitter.share_dialog_url({
      url:  encode_html(BountySource.www_host+'#repos/'+solution.issue.repository.full_name+'/issues/'+solution.issue.number),
      text: ("I submitted a solution to " + solution.issue.repository.full_name + " on BountySource.")
    });
  });
}
