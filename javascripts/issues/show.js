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
            h1({ id: 'issue-title' },
              div(Issue.status_element(issue)),
              div({ style: !issue.can_add_bounty ? 'text-decoration: line-through;' : '' }, (issue.number  ? '#' + issue.number + ': ' : '') + issue.title)
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


            // leaderboard of top 5 backers!
            // always show that shit homie
            p({ style: 'margin: 15px 0 10px 15px; padding: 0;' }, 'Top Bounties:'),

            table({ 'class': 'leaderboard', style: 'margin-bottom: 5px;' },
              issue.bounties.slice(0,3).map(function(bounty) {
                return tr(
                  td({ style: 'width: 30px; text-align: center;' }, a({ href: bounty.person.frontend_path }, img({ src: bounty.person.image_url }))),
                  td(a({ href: bounty.person.frontend_path }, bounty.person.display_name)),
                  td({ style: 'text-align: right;' }, money(bounty.amount))
                )
              })
            ),

            (issue.bounty_total > 0 && !issue.accepted_solution) && DeveloperBox.create(issue)
          )
        );
      }
    });
  });

  // show the currently submitted and/or accepted Solution
  define('solution_info', function(issue) {
    var target_div = div({ id: 'issue-solution-wrapper' });

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

      // select the first merged solution, if any.
      var solution;
      for (var i=0; i<issue.submitted_solutions.length; i++) {
        if (issue.submitted_solutions[i].merged) {
          solution = issue.submitted_solutions[i];
          break;
        }
      }

      // if no solution has been merged, show the first one that was submitted.
      if (!solution) solution = issue.submitted_solutions[0];

      // does it exist? say something about it!
      if (solution) {
        // if issue is disputed, add class to wrapper div
        if (solution.disputed) add_class(target_div, 'disputed');

        var view_solution_button_class  = solution.pull_request ? 'btn-auth btn-github' : 'button blue';
        var view_solution_button_text   = solution.pull_request ? 'View Solution on GitHub' : 'View Solution';

        var solution_title_element = h2('Solution');
        var solution_status_div = div({ id: 'solution-status' });

        render({ into: target_div },
          solution_title_element,

          div({ style: 'margin-bottom: 10px;' },
            'by ',
            a({ href: solution.person.frontend_path },
              img({ style: 'display: inline-block; vertical-align: middle; width: 24px; height: 24px; border-radius: 2px;', src: solution.person.image_url }),
              div({ style: 'display: inline-block; vertical-align: middle; margin-left: 5px;' }, solution.person.display_name)
            )
          ),

          div({ id: 'solution-body' }, '"' + solution.body + '"'),

          a({ href: solution.code_url, target: '_blank', 'class': view_solution_button_class, style: 'display: inline-block; width: 200px;' }, view_solution_button_text),

          solution_status_div
        );

        if (solution.disputed) {
          render({ into: solution_title_element }, 'Solution Disputed');

          var disputes_table = table({ 'id': 'solution-disputes' }, 'Loading...');

          // solution has been disputed. show all of the disputes!
          render({ into: solution_status_div },
            div({ style: 'line-height: 25px;' },
              "If you feel that this solution does not sufficiently solve the issue, file a ",
              a({ href: file_dispute_href(solution) }, 'dispute'),
              " with us. If there are no outstanding disputes after ",
              strong(formatted_date(solution.dispute_period_end_date)),
              ", then the solution will be accepted and the bounty paid out."
            ),

            h4("Disputed Filed"),
            div({ id: 'dispute-alerts' }),
            disputes_table,
            p("To join the discussion regarding disputes, refer to the ", a({ href: issue.url, target: '_blank' }, "issue comments"))
          );

          // load disputes
          BountySource.api('/issues/'+issue.id+'/solutions/'+solution.id+'/disputes', function(response) {
            render({ into: disputes_table },
              tr(
                th({ style: 'width: 100px;' }),
                th(),
                th({ style: 'width: 100px; text-align: center;' })
              ),
              response.data.map(function(dispute) {
                var row = tr(
                  td('Dispute #' + dispute.number),
                  td(dispute.body),
                  td({ style: 'text-align: center;' },
                    div(dispute.closed ? 'Resolved' : 'Unresolved'),

                    // logged in person filed the dispute? show close button
                    (dispute.owner && !dispute.closed) && div(
                      button({ style: 'margin-top: 5px;', onClick: curry(close_dispute, solution, dispute) }, 'Close Dispute')
                    )
                  )
                );

                // strikethrough resolved disputes
                if (dispute.closed) add_class(row, 'closed');

                return row;
              })
            );
          });

        } else if (solution.in_dispute_period) {
          render({ into: solution_title_element }, 'Solution In Dispute Period');

          // already in dispute period, show that message
          render({ into: solution_status_div },
            div({ style: 'line-height: 25px;' },
              "If you feel that this solution does not sufficiently solve the issue, file a ",
              a({ href: file_dispute_href(solution) }, 'dispute'),
              " with us. If there are no outstanding disputes after ",
              strong(formatted_date(solution.dispute_period_end_date)),
              ", then the solution will be accepted and the bounty paid out."
            )
          );
        } else {
          render({ into: solution_title_element }, 'Solution Submitted');

          var message_div = div();

          render({ into: solution_status_div },
            strong('Status: '), message_div,
            p("When this is completed, the solution will enter a two week dispute period. If there are outstanding disputes after that period, the bounty will be awarded to the developer.")
          );

          // waiting for issue to be closed
          if (issue.can_add_bounty) {
            render({ into: message_div }, 'Waiting for the issue to be closed.');
          } else if (solution.pull_request) {
            render({ into: message_div }, 'Waiting for GitHub pull request to be merged.');
          } else {
            console.log("Logic bug! Hiding solution box");
            return;
          }
        }

      }
    } else if (!issue.can_add_bounty && issue.bounty_total > 0) {
      render({ into: target_div },
        h2({ style: 'margin: 10px 0;' }, money(issue.bounty_total), ' Bounty Available'),
        p("Did you solve this issue? Submit a solution and claim the bounty!")
      );
    }

    if (target_div.innerHTML) return target_div;
  });

  define('file_dispute_href', function(solution) {
    return '#issues/'+solution.issue.id+'/solutions/'+solution.id+'/disputes/create';
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

  define('close_dispute', function(solution, dispute) {
    if (confirm('Are you sure you want to close your dispute?')) {
      render({ target: 'dispute-alerts' }, '');

      BountySource.api('/issues/'+solution.issue.id+'/solutions/'+solution.id+'/disputes/'+dispute.number+'/close', 'POST', function(response) {

        console.log(response);

        if (response.meta.success) {
          set_route(solution.issue.frontend_path);
        } else {
          render({ target: 'dispute-alerts' }, error_message(response.data.error));
        }
      });
    }
  });
}
