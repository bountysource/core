with (scope('Show', 'Issue')) {

  route('#issues/:issue_id', function(issue_id) {
    Show.errors_div = div();
    Show.target_div = div('Loading...');

    render(Show.target_div);

    BountySource.get_issue(issue_id, function(response) {
      if (!response.meta.success) {
        render({ into: Show.errors_div }, error_message(response.data.error));
        render({ into: Show.target_div }, '');
      } else {
        var issue = response.data||{};

        App.update_facebook_like_button({
          name:         issue.tracker.name+": "+issue.title,
          caption:      issue.title,
          description:  "Bountysource is the funding platform for open-source software. Create a bounty to help get this issue resolved, or submit a pull request to earn the bounty yourself!",
          picture:      issue.tracker.image_url
        });

        render({ into: Show.target_div },
          breadcrumbs(
            a({ href: '#' }, 'Home'),
            a({ href: '#trackers/' + issue.tracker.slug }, issue.tracker.name),
            //a({ href: '#trackers/' + issue.tracker.slug + '/issues' }, 'Issues'),
            truncate(issue.title,40)
          ),

          Columns.create({ show_side: true }),

          Columns.main(
            // used to render messages into
            Show.errors_div,

            // title of issue, with closed or open notification.
            // if issue is closed, add line-through
            h1({ style: 'font-size: 26px; line-height: 30px; font-weight: normal; color: #565656' },
              span({ style: !issue.can_add_bounty ? 'text-decoration: line-through;' : '' }, (issue.number  ? '#' + issue.number + ': ' : '') + issue.title),
              div({ style: 'padding-left: 20px; display: inline-block;' }, Issue.status_element(issue))
            ),

            // show status of the submitted solution
            div({ style: 'margin-bottom: 20px;' },
              solution_info(issue)
            ),

            issue.body_html && github_user_html_box(issue),

            div({ style: 'margin: 25px 0;' },
              issue.url.match(/github\.com/) ? [
                div({ style: 'display: inline-block; vertical-align: middle; margin-right: 10px;' }, 'For more information, or to comment:'),
                a({ 'class': 'btn-auth btn-github', style: 'display: inline-block; vertical-align: middle;', href: issue.url, target: '_blank' }, 'View Issue on GitHub')
              ] : [
                'For more information, view the issue details at: ',
                a({ href: issue.url, target: '_blank', }, truncate(issue.url,40))
              ]
            ),

            issue.comments && issue.comments.length > 0 && div(
              h2({ style: 'font-size: 26px; line-height: 30px; font-weight: normal; color: #565656' }, 'Comments'),
              issue.comments.map(github_user_html_box)
            )
          ),

          Columns.side(
            issue.can_add_bounty && bounty_box(issue),
            DeveloperBox.create(issue)
          )
        );
      }
    });
  });

  // show the currently submitted and/or accepted Solution
  define('solution_info', function(issue) {
    var target_div = div({ id: 'solution-status', style: 'text-align: center; padding: 10px 30px; background: #EBFFE4; box-shadow: 0 0 10px #A1E9A1; border-radius: 3px;' });

    if (issue.accepted_solution) {
      // a solution was accepted, awesome!
      render({ into: target_div },
        h2({ style: 'margin: 10px 0;' }, money(issue.bounty_total), ' Bounty Awarded!'),

        div({ style: 'margin-bottom: 10px;' },
          'to ',
          a({ href: issue.accepted_solution.person.frontend_path },
            img({ style: 'display: inline-block; vertical-align: middle; width: 24px; height: 24px; border-radius: 2px;', src: issue.accepted_solution.person.image_url }),
            div({ style: 'display: inline-block; vertical-align: middle; margin-left: 5px;' }, issue.accepted_solution.person.display_name)
          )
        ),

        a({ href: issue.accepted_solution.code_url, target: '_blank', 'class': 'button blue', style: 'width: 200px; display: inline-block;' }, 'View Solution')
      );

    } else if (issue.submitted_solutions.length > 0) {
      // TODO show all submitted solutions
      // select the first solution that was submitted
      var solution = issue.submitted_solutions[0];

      // does it exist? say something about it!
      if (solution) {
        // if there is no dispute period end date, the solution is pending acceptance
        render({ into: target_div },
          h2({ style: 'margin: 10px 0;' }, 'Solution Submitted'),

          div({ style: 'margin-bottom: 10px;' },
            'by ',
            a({ href: solution.person.frontend_path },
              img({ style: 'display: inline-block; vertical-align: middle; width: 24px; height: 24px; border-radius: 2px;', src: solution.person.image_url }),
              div({ style: 'display: inline-block; vertical-align: middle; margin-left: 5px;' }, solution.person.display_name)
            )
          ),

          p('"' + solution.body + '"'),

          a({ href: solution.code_url, target: '_blank', 'class': 'button blue', style: 'display: inline-block; width: 200px;' }, 'View Solution'),

          solution.dispute_period_end_date && p({ style: 'line-height: 25px;' },
            "If you feel that this solution does not sufficiently solve the issue, file a ",
            a({ href: dispute_period_email_href(solution) }, 'dispute'),
            " with us. If there are no outstanding disputes after ",
            strong(formatted_date(solution.dispute_period_end_date)),
            ", then the solution will be accepted and the bounty paid out."
          )
        );
      }
    } else if (!issue.can_add_bounty && issue.bounty_total > 0) {
      render({ into: target_div },
        h2({ style: 'margin: 10px 0;' }, money(issue.bounty_total), ' Bounty Available'),
        p("Did you solve this issue? Submit a solution and claim the bounty!")
      );
    }

    if (target_div.innerHTML) return target_div;
  });

  define('dispute_period_email_href', function(solution) {
    return  "mailto:support@bountysource.com?subject="+ encodeURIComponent("Dispute") +
      "&body=" + encodeURIComponent("Issue Name: " + solution.issue.title + "\nIssue URL: " + solution.issue.frontend_path + "\n\nPlease describe the issue you have with " + solution.person.display_name + "'s solution:");
  });

  define('github_user_html_box', function(options) {
    return div({ style: 'margin-bottom: -1px' },
      options.author_image_url && img({ src: options.author_image_url, style: 'width: 50px; height: 50px; float: left' }),

      div({ style: 'margin-left: 70px; background: #f7f7f7; border-top: 1px solid #e3e3e3; border-bottom: 1px solid #e3e3e3; overflow: auto; padding: 10px;' },
        div({ style: 'color: #b4b4b4; margin-bottom: 6px' }, options.author_name, ' commented ', time_ago_in_words(options.created_at), ' ago:'),

        div({ 'class': 'gfm', html: options.body_html })
      )
    );
  });
  
  define('bounty_box', function(issue) {
    return div({ id: 'bounty-box' },
      div({ style: 'padding: 0 21px' }, ribbon_header("Backers")),

      issue.bounty_total > 0 && section(
        div({ 'class': 'total_bounties' }, money(issue.bounty_total)),
        div({ style: 'text-align: center' }, "From ", issue.bounties.length, " bount" + (issue.bounties.length == 1 ? 'y' : 'ies') + ".")
      ),

      section({ style: 'padding: 21px' },
        form({ action: curry(create_bounty, issue) },

          div({ id: 'create-bounty-errors' }),

          div({ 'class': 'amount' },
            label({ 'for': 'amount-input' }, '$'),
            text({ placeholder: "25", name: 'amount', id: 'amount-input', value: get_params().amount || '' })
          ),

          Payment.payment_methods({ style: 'margin: 10px 0;', value: get_params().payment_method }),

          submit({ 'class': 'button blue', style: 'width: 100%;' }, 'Create Bounty')
        )
      )
    );
  });

  define('create_bounty', function(issue, form_data) {
    var payment_data = {
      amount: form_data.amount,
      payment_method: form_data.payment_method,
      item_number: 'issues/' + issue.id,
      success_url: window.location.href.split('#')[0] + issue.frontend_path + '/bounties/:item_id/receipt',
      cancel_url: window.location.href.split('#')[0] + issue.frontend_path,
      postauth_url: window.location.href.split('#')[0] + issue.frontend_path + '?payment_method='+form_data.payment_method+'&amount='+form_data.amount
    };

    BountySource.make_payment(payment_data, function(errors) {
      render({ target: 'create-bounty-errors' }, error_message(errors));
    });
  });

  define('create_solution', function(login, repository, issue_number, form_data) {
    BountySource.create_solution(login, repository, issue_number, form_data.pull_request_number, function(response) {
      if (response.meta.success) {
        set_route('#solutions/'+response.data.id+'/receipt');
      } else {
        render({ target: 'developer-box-messages' }, error_message(response.data.error));
      }
    });
  });
}
