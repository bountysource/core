with (scope('Issue', 'App')) {

  // determine if a developer has started working on a solution for the issue.
  // callback param is a boolean. returns the solution if dev created one, false otherwise
  define('get_solution', function(issue_number, callback) {
    if (!Storage.get('access_token')) return callback(false);
    BountySource.user_info(function(response) {
      var user_info = response.data||{};
      for (var i=0; user_info.solutions && i<user_info.solutions.length; i++) {
        if (parseInt(user_info.solutions[i].issue.number) == parseInt(issue_number)) return callback(user_info.solutions[i]);
      }
      callback(false);
    });
  });

  route('#repos/:login/:repository/issues/:issue_number', function(login, repository, issue_number) {
    var target_div = div('Loading...');


    render(
      breadcrumbs(
        a({ href: '#repos/search/' + repository }, 'Projects'),
        a({ href: '#repos/' + login + '/' + repository + '/issues' }, login + '/' + repository),
        ('Issue #' + issue_number)
      ),

      target_div
    );

    BountySource.get_issue(login, repository, issue_number, function(response) {
      var issue = response.data||{};

      render({ into: target_div },
        div({ 'class': 'split-main' },

          h1({ style: 'font-size: 26px; line-height: 30px' }, issue.title),
          div({ html: issue.body }),

          issue.comments.length > 0 && div(
            h2('Comments'),
            issue.comments.map(function(comment) {
              return div({ style: 'border: 1px solid #888; padding: 5px; margin-bottom: 20px' }, 
                img({ src: comment.user.avatar_url, style: 'float: left; width:80px; height:80px' }), 
                b(comment.user.login), ' on ', comment.created_at,
                div({ html: comment.body_html }),
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
          bounty_box(issue),
          developer_box(issue),
          misc_box(issue)
        ),

        div({ 'class': 'split-end' })
      );
    });
  });
  
  define('bounty_box', function(issue) {
    return div({ id: 'bounty-box' },
      div({ style: 'padding: 0 21px' }, ribbon_header("Backers")),
      
      issue.account_balance > 0 && section(
        div({ 'class': 'total_bounties' }, money(issue.account_balance)),
        div({ style: 'text-align: center' }, "From ", issue.bounties.length, " backer" + (issue.bounties.length == 1 ? '' : 's') + ".")
        
        
        // issue.bounties && (issue.bounties.length > 0) && div(
        //   issue.bounties.map(function(bounty) {
        //     return div(money(bounty.amount));
        //   })
        // )
      ),

      section({ style: 'padding: 21px' },
        form({ action: curry(create_bounty, issue.repository.owner, issue.repository.name, issue.number) },
          div({ 'class': 'amount' },
            label({ 'for': 'amount-input' }, '$'),
            text({ placeholder: "25.00", name: 'amount', id: 'amount-input' })
          ),
          div({ 'class': 'payment-method' },
            div(radio({ name: 'payment_method', value: 'paypal', checked: 'checked', id: 'payment_method_paypal' }), label({ 'for': 'payment_method_paypal' }, img({ src: 'images/paypal.png'}), "PayPal")),
            div(radio({ name: 'payment_method', value: 'google', id: 'payment_method_google' }), label({ 'for': 'payment_method_google' }, img({ src: 'images/google-wallet.png'}), "Google Wallet"))
          ),
          submit({ 'class': 'blue' }, 'Create Bounty')
        )
      )
    );
  });
  
  define('developer_box', function(issue) {
    var developer_div = div('awesome-spinner');
    
    get_solution(issue.number, function(solution) {
      if (solution) {
        render({ into: developer_div },
          div({ style: 'margin-bottom: 10px;' },
            a({ 'class': 'green', href: '#solutions/'+issue.repository.full_name+'/issues/'+issue.number+'/submit' }, 'Submit for Approval')
          ),

          div('Your Fork: ', a({ target: '_blank', href: solution.head.repository.url+'/tree/'+solution.head.name }, solution.head.repository.full_name)),
          br(),
          div('Base Repository: ', a({ target: '_blank', href: solution.base.repository.url }, solution.base.repository.full_name))
        );
      } else {
        render({ into: developer_div },
          Github.link_requiring_auth({ 'class': 'green', href: '#repos/'+issue.repository.full_name+'/issues/'+issue.number+'/fork' }, 'Start Working')
        );
      }
    });
    
    return div({ style: 'background: #dff7cb; padding: 0 21px 21px 21px; margin: 20px 15px' },
      ribbon_header("Developers"),
      br(),
      developer_div
    );
  });
  
  define('misc_box', function(issue) {
    return div({ style: 'background: #e8f6f5; margin: 20px 15px'}, 
      h3('Fields'),
      div("State: ", issue.state),
      div("Owner: ", issue.owner),
      div("Has code: ", issue.code ? 'Yes' : 'No'),
      issue.labels && issue.labels.length > 0 && div("Lables: ", ul(issue.labels))
    );
  });
  

  define('create_bounty', function(login, repository, issue, form_data) {
    BountySource.create_bounty(login, repository, issue, form_data.amount, form_data.payment_method, window.location.href, function(response) {
      window.location.href = response.data.redirect_url;
    });
  });
};