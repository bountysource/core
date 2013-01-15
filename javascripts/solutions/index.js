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
                td(solution_status_box(solution))
              )
            })
          )
        )
      }
    });
  });

  // render status box for solution. states are: pending merge, in dispute period, disputed, accepted.
  define('solution_status_box', function(solution) {
    // dispute period end date is 14 days after the solutions acceptance date
    if (solution.accepted_at) {
      var accepted_at_date    = new Date(solution.accepted_at);
      var dispute_period_ends = new Date(accepted_at_date.getTime() + (14*24*60*60*1000));
    }

    if (solution.accepted && !solution.disputed && !solution.in_dispute_period) {
      return div({ style: 'margin: 5px 0;' },
        small_success_message({ close_button: false, style: 'margin: 5px 0;' }, 'Solution accepted!'),
        a({ 'class': 'green', href: '#solutions/'+solution.id+'/payout' }, 'Claim Bounty!')
      );
    } else if (solution.disputed) {
      return div({ style: 'margin: 5px 0;' },
        error_message({ close_button: false, style: 'margin: 5px 0;' },
          p('Solution has been disputed, and is currently under review.'),
          p('If all outstanding disputes are resolved before ', strong(date(dispute_period_ends)), ', you will be able to claim the bounty.'),
          ul(
            li('What does this mean? ', a({ href: '#faq/developers' }, 'More info.')),
            li('Have any questions? Feel free to ', a({ href: 'mailto:support@bountysource.com' }, 'contact support.'))
          )
        )
      );
    } else if (solution.in_dispute_period) {
      return div({ style: 'margin: 5px 0;' },
        info_message({ close_button: false, style: 'margin: 5px 0;' },
          p('Solution has been merged, but is in the dispute period.'),
          p('If there are no outstanding disputes after ', strong(date(dispute_period_ends)), ', you will be able to claim the bounty.'),
          ul(
            li('What does this mean? ', a({ href: '#faq/developers' }, 'More info.')),
            li('Have any questions? Feel free to ', a({ href: 'mailto:support@bountysource.com' }, 'contact support.'))
          )
        )
      );
    } else if (solution.pull_request.merged) {
      return info_message({ style: 'margin: 0;' },
        p("The pull request that you submitted has been merged, but the underlying issue has not yet been closed."),
        p("Your solution will be accepted when your pull request is merged, and the underlying issue is closed."),
        ul(
          li('What does this mean? ', a({ href: '#faq/developers' }, 'More info.')),
          li('Have any questions? Feel free to ', a({ href: 'mailto:support@bountysource.com' }, 'contact support.'))
        )
      );
    } else {
      return info_message({ style: 'margin: 0;' },
        p("Your pull request has not yet been merged."),
        p("Your solution will be accepted when your pull request is merged, and the underlying issue is closed."),
        ul(
          li('What does this mean? ', a({ href: '#faq/developers' }, 'More info.')),
          li('Have any questions? Feel free to ', a({ href: 'mailto:support@bountysource.com' }, 'contact support.'))
        )
      );
    }
  });
};