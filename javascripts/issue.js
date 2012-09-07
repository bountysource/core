with (scope('Issue', 'App')) {
  route('#repos/:login/:repository/issues', function(login, repository) {
    var target_div = div('Loading...');

    render(
      h2(login+'/'+repository + ': Issues'),
      target_div
    );

    BountySource.get_issues(login, repository, function(response) {
      if (response.data && response.data.error) {
        render({ into: target_div },
          div(response.data.error)
        );
      } else {
        var issues = response.data||[];

        render({ into: target_div },
          table(
            tr(
              th('ID'),
              th('Title'),
              th('Bounties'),
              th('Code'),
              th('Comments'),
              th('State'),
              th('Updated')
            ),

            (issues||[]).map(function(issue) {
              return tr(
                td(issue.number),
                td(a({ href: '#repos/'+login+'/'+repository+'/issues/'+issue.number }, issue.title)),
                td('$'+issue.account_balance),
                td(issue.code ? '✔' : ''),
                td(issue.comments),
                td(issue.state),
                td({ style: 'white-space:nowrap' }, (issue.updated_at||"").substr(0,10))
              )
            })
          )
        );
      }
    });
  });

  route('#repos/:login/:repository/issues/:issue_number', function(login, repository, issue_number) {
    var target_div = div('Loading...');

    render(target_div);

    BountySource.get_issue(login, repository, issue_number, function(response) {
      var issue = response.data||{};

      render({ into: target_div },
        div({ 'class': 'split-main' },
          h2(a({ href: '#repos/' + login + '/' + repository + '/issues' }, login+'/'+repository + ' - Issues'), ' - #' + issue_number),
          issue.body.split("\n").map(function(txt) { return div(txt); }),

          issue.bounties.length > 0 && div(
            h2('Bounties on This Issue'),
            issue.bounties.map(function(bounty) {
              return div(bounty.amount);
            })
          )
        ),

        div({ 'class': 'split-side' },
          div(
            issue.account_balance > 0 && div(
              h3('Total Bounties'),
              span({ style: 'font-size: 50px; font-weight: bold' }, '$'+issue.account_balance+'.00')
            ),

            h3('Create Bounty:'),
            form({ action: curry(create_bounty, login, repository, issue_number) },
              'Amount: $', text({ placeholder: "100.00", name: 'amount', style: "width: 50px" }),
              div(radio({ name: 'payment_method', value: 'paypal', checked: 'checked', id: 'payment_method_paypal' }), label({ 'for': 'payment_method_paypal' }, "PayPal")),
              div(radio({ name: 'payment_method', value: 'google', id: 'payment_method_google' }), label({ 'for': 'payment_method_google' }, "Google Wallet")),
              submit()
            ),

            h3('Developers:'),
            ul({ style: 'padding-bottom: 10px;' },
              li(Github.link_requiring_auth({
                text: 'Start working on a solution',
                route: '#repos/'+issue.repository.full_name+'/issues/'+issue_number+'/fork'
              }))
            )
          ),

          issue.labels && issue.labels.length > 0 && div(
            h3('Lables:'),
            ul(issue.labels)
          )
        ),

        div({ 'class': 'split-end' })
      );
    });
  });

  define('create_bounty', function(login, repository, issue, form_data) {
    BountySource.create_bounty(login, repository, issue, form_data.amount, form_data.payment_method, window.location.href, function(response) {
      window.location.href = response.data.redirect_url;
    });
  });
};