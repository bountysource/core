with (scope('Repository', 'App')) {

  // Copied from issues/show.js
  define('donation_box', function(repo) {
    return div({ id: 'bounty-box' },
      div({ style: 'padding: 0 21px' }, ribbon_header("Backers")),

      repo.account_balance > 0 && section(
        div({ 'class': 'total_bounties' }, money(repo.account_balance)),
        div({ style: 'text-align: center' }, "From ", repo.bounties.length, " backer" + (repo.bounties.length == 1 ? '' : 's') + ".")


        // repo.bounties && (repo.bounties.length > 0) && div(
        //   repo.bounties.map(function(donation) {
        //     return div(money(donation.amount));
        //   })
        // )
      ),

      section({ style: 'padding: 21px' },
        form({ action: curry(create_bounty, repo.owner, repo.name, repo.number) },
          div({ id: 'create-bounty-errors' }),

          div({ 'class': 'amount' },
            label({ 'for': 'amount-input' }, '$'),
            text({ placeholder: "25", name: 'amount', id: 'amount-input' })
          ),
          div({ 'class': 'payment-method' },
            div(radio({ name: 'payment_method', value: 'paypal', checked: 'checked', id: 'payment_method_paypal' }), label({ 'for': 'payment_method_paypal' }, img({ src: 'images/paypal.png'}), "PayPal")),
            div(radio({ name: 'payment_method', value: 'google', id: 'payment_method_google' }), label({ style: 'color: #C2C2C2;', 'for': 'payment_method_google' }, img({ src: 'images/google-wallet.png'}), "Google Wallet")),
            div(radio({ disabled: true, name: 'payment_method', value: 'amazon', id: 'payment_method_amazon' }), label({ style: 'color: #C2C2C2;', 'for': 'payment_method_amazon' }, img({ src: 'images/amazon.png'}), "Amazon.com"))
          ),
          submit({ 'class': 'blue' }, 'Donate')
        )
      )
    );
  });

  // Copied from issues/show.js
  define('create_bounty', function(login, repository, issue, form_data) {
    return BountySource.create_bounty(login, repository, issue, form_data.amount, form_data.payment_method, window.location.href, function(response) {
      if (response.meta.success) {
        window.location.href = response.data.redirect_url;
      } else {
        render({ target: 'create-bounty-errors' }, div(response.data.error.join(', '), br()));
      }
    });
  });


  route('#repos/:login/:repository', function(login, repository) {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        (login + '/' + repository)
      ),

      target_div
    );

    BountySource.get_repository_overview(login, repository, function(response) {
      if (!response.meta.success) return render({ into: target_div }, response.data.error || response.data.message);

      var repo = response.data;
      render({ into: target_div },
        div({ 'class': 'split-main' },
          section(
            img({ src: repo.owner.avatar_url, style: 'width: 75px; height: 75px; vertical-align: middle; margin-right: 10px; float: left'}),
            h2({ style: 'margin: 0 0 10px 0' }, repo.owner.login),
            repo.owner.login != repo.name && h2({ style: 'margin: 0 0 10px 0' }, repo.name),
            repo.description && span(repo.description),
            div({ style: 'clear: both' })
          ),
        
          issue_table({ header_class: 'thick-line-green' }, "Featured", repo.issues_featured),
          issue_table({ header_class: 'thick-line-blue' }, "Popular", repo.issues_popular),
          issue_table({ header_class: 'thick-line-orange' }, "Most Recent", repo.issues_most_recent),
          
          div({ style: 'margin-top: 20px; width: 150px' }, a({ 'class': 'blue', href: '#repos/'+repo.full_name+'/issues'}, 'View All Issues'))
        ),
        div({ 'class': 'split-side' },

          donation_box(repo),
          div({ 'class': 'stats', style: 'width: 150px; padding: 10px; margin: 20px auto auto auto;' },
            h2(formatted_number(repo.followers)),
            h3({ 'class': 'blue-line' }, 'Followers'),


            h2(formatted_number(repo.forks)),
            h3({ 'class': 'blue-line' }, 'Forks'),

            h2(formatted_number(repo.bounties.length)),
            h3({ 'class': 'blue-line' }, 'Open Contests'),

            h2(money(repo.bounties_total)),
            h3({ 'class': 'orange-line' }, 'Active Bounties')

//            h2('$999'),
//            h3({ 'class': 'green-line' }, 'Payout Last Month')
          )
          
//          repo.committers && div({ style: 'background: #dff7cb; padding: 10px; margin-top: 20px' },
//            h2({ style: 'color: #93a385; text-align: center; font-size: 18px; font-weight: normal; margin: 0 0 10px 0' }, "Committers"),
//            ul({ style: 'margin: 0; padding: 0' }, repo.committers.map(function(commiter) {
//              return li({ style: 'margin: 0 0 5px 0; padding: 0; list-style: none' },
//                img({ src: 'https://a248.e.akamai.net/assets.github.com/images/gravatars/gravatar-user-420.png', style: 'width: 32px; height: 32px; vertical-align: middle; margin-right: 10px' }),
//                commiter
//              );
//            }))
//          )

        ),
        div({ 'class': 'split-end' })
      );
    });
  });
  
  define('issue_table', function(options, title, issues) {
    if (!issues || issues.length == 0) return;
    return section({ 'class': 'issue-table' },
      h2({ 'class': options.header_class }, title),
      table(
        issues.map(function(issue) {
          return tr(
            td({ style: 'padding-right: 10px' }, a({ href: '#repos/'+issue.repository.full_name+'/issues/'+issue.number, style: 'color: #93979a' }, '#' + issue.number)),
            td({ style: 'width: 100%' }, a({ href: '#repos/'+issue.repository.full_name+'/issues/'+issue.number }, issue.title)),
            td({ style: 'text-align: right; color: #7cc5e3; white-space: nowrap' }, issue.solutions > 0 && [issue.solutions, ' ', img({ style: 'vertical-align: middle', src: 'images/icon-developer.png' })]),
            td({ style: 'text-align: right; color: #d8a135; white-space: nowrap' }, issue.comments > 0 && [issue.comments, ' ', img({ style: 'vertical-align: middle', src: 'images/icon-comments.png' })]),
            td({ style: 'text-align: right; white-space' }, issue.account_balance > 0 && span({ style: 'background: #83d11a; border-radius: 2px; padding: 3px; color: white' }, money(issue.account_balance)))
          );
        })
      )
    );
  });

}
