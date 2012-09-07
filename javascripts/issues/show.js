with (scope('Issue', 'App')) {

  route('#repos/:login/:repository/issues/:issue_number', function(login, repository, issue_number) {
    var target_div = div('Loading...');

    render(target_div);

    BountySource.get_issue(login, repository, issue_number, function(response) {
      var issue = response.data||{};
      //console.log(issue);

      render({ into: target_div },
        div({ 'class': 'split-main' },
          h2('Repository - ' + login+'/'+repository + ' - Issues - #' + issue_number),
          issue.body && issue.body.split("\n").map(function(txt) { return div(txt); }),

          issue.bounties.length > 0 && div(
            h2('Bounties on This Issue'),
            issue.bounties.map(function(bounty) {
              return div(bounty.amount);
            })
          ),
          
          issue.comments.length > 0 && div(
            h2('Comments'),
            issue.comments.map(function(comment) {
              return div({ style: 'border: 1px solid #888; padding: 5px; margin-bottom: 20px' }, 
                img({ src: comment.user.avatar_url, style: 'float: left; width:80px; height:80px' }), 
                b(comment.user.login), ' on ', comment.created_at,
                div(comment.body),
                div({ style: 'clear: left' })
              );
            })
          ),
          
          issue.events.length > 0 && div(
            h2('Events'),
            issue.events.map(function(event) {
              return div({ style: 'border: 1px solid #888; padding: 5px; margin-bottom: 20px' }, 
                img({ src: event.actor.avatar_url, style: 'float: left; width:80px; height:80px' }), 
                b(event.actor.login), ' on ', event.created_at,
                div(event.event),
                div(event.commit_id),
                div({ style: 'clear: left' })
              );
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

            h3('Fields'),
            div("State: ", issue.state),
            div("Owner: ", issue.owner),
            div("Has code: ", issue.code ? 'Yes' : 'No'),

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