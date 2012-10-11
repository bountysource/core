with (scope('Payout','IssueBranch')) {
  route('#repos/:login/:repository/issues/:issue_number/issue_branch/payout', function(login, repository, issue_number) {
    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#repos/' + login + '/' + repository }, login + '/' + repository),
        a({ href: '#repos/' + login + '/' + repository + '/issues' }, 'Issues'),
        a({ href: '#repos/' + login + '/' + repository + '/issues/' + issue_number }, '#' + issue_number),
        a({ href: '#repos/' + login + '/' + repository + '/issues/' + issue_number + '/issue_branch' }, 'Issue Branch'),
        ('Payment Details')
      ),

//      success_message(
//        span({ style: 'font-weight: bold;' }, "Congratulations, your solution was accepted, earning you the bounty! Tell us how to give you money:")
//      ),

      div({ style: 'width: 415px; height: 160px; background: #eee; border: 1px solid #ccc; float: left; margin-right: 20px; padding: 20px' },
        h2({ style: 'text-transform: uppercase; color: #5e5f5f; font-size: 21px; text-align: center; font-weight: normal; margin-bottom: 10px' }, 'Physical Check'),
        p({ style: 'font-style: italic; color #eee; text-align: center;' }, "I want BountySource to mail me a check for the bounty that I earned."),

        a({ 'class': 'blue', style: 'width: 200px; margin: 0 auto;', href: show_address_form }, 'Mail a Check')
      ),

      div({ style: 'width: 415px; height: 160px; background: #eee; border: 1px solid #ccc; float: left; padding: 20px' },
        h2({ style: 'text-transform: uppercase; color: #5e5f5f; font-size: 21px; text-align: center; font-weight: normal; margin-bottom: 10px' }, 'Paypal Transfer'),
        p({ style: 'font-style: italic; color #eee; text-align: center;' }, "I want BountySource to credit my Paypal account with the bounty that I earned."),

        a({ 'class': 'blue', style: 'width: 200px; margin: 0 auto;', href: show_paypal_form }, 'Paypal')
      ),

      div({ style: 'clear: both' }),

      br(),
      messages(),

      div({ id: '_form_container', style: 'width: 892px; background: #eee; border: 1px solid #ccc; float: left; margin: auto; padding: 20px; display: none;' },
        div({ id: '_address_form', style: 'display: none;' }, Account.create_address_form(create_mailing_address)),
        div({ id: '_paypal_form', style: 'display: none;' }, Paypal.link_account(update_account_with_paypal_email))
      ),

      div({ style: 'clear: both' })
    );
  });

  define('show_address_form', function() {
    show('_form_container');
    hide('_paypal_form');
    show('_address_form');
  });

  define('show_paypal_form', function() {
    show('_form_container');
    show('_paypal_form');
    hide('_address_form');
  });

  define('create_mailing_address', function(form_data) {
    clear_message();
    Account.create_or_update_address(form_data, function(response) {
      if (response.meta.success) {
        set_route(get_route()+'/donation');
      } else {
        render_message(error_message(response.data.error));
      }
    });
  });

  define('update_account_with_paypal_email', function(form_data) {
    clear_message();
    BountySource.update_account(form_data, function(response) {
      if (response.meta.success) {
        set_route(get_route()+'/donation');
      } else {
        render_message(error_message(response.data.error));
      }
    });
  });




  route('#repos/:login/:repository/issues/:issue_number/issue_branch/payout/donation', function(login, repository, issue_number) {
    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#repos/' + login + '/' + repository }, login + '/' + repository),
        a({ href: '#repos/' + login + '/' + repository + '/issues' }, 'Issues'),
        a({ href: '#repos/' + login + '/' + repository + '/issues/' + issue_number }, '#' + issue_number),
        a({ href: '#repos/' + login + '/' + repository + '/issues/' + issue_number + '/issue_branch' }, 'Issue Branch'),
        a({ href: '#repos/' + login + '/' + repository + '/issues/' + issue_number + '/issue_branch/payout' }, 'Payment Details'),
        ('Donation')
      ),

      form({ 'class': 'fancy', action: claim_bounty },
        fieldset(
          label('Project Donation:'),
          donation_slider({ 'data-tax': 0.15, style: 'width: 500px;', name: 'project' }),
          p({ style: 'font-style: italic; font-size: 12px;' }, '*This project requires a minimum donation.')
        ),
        fieldset(
          label('Charity:'),
          donation_slider({ style: 'width: 500px;', name: 'charity' })
        ),
        fieldset(
          label('BountySource Tip:'),
          donation_slider({ 'data-tax': 0.10, style: 'width: 500px;', name: 'bountysource' }),
          p({ style: 'font-style: italic; font-size: 12px; width: 350px;' }, '*BountySource receives a small portion of your earnings, but you can donate more if you want.')
        ),
        fieldset(
          label('Your Cut'),
          div({ id: 'total-cut', style: 'font-size: 30px; display: inline;' }, money(0))
        ),
        fieldset({ 'class': 'no-label' },
          submit({ 'class': 'green' }, 'Claim Bounty')
        )
      )
    );

    // group dem ranges together
    // TODO wire in real bounty amount from solution object
    donation_slider_group({ max: 500.0, difference_element_id: 'total-cut' }, 'project', 'charity', 'bountysource');
  });

  define('claim_bounty', function(form_data) {
    if (confirm('Are you sure?')) {
      console.log(form_data);
    }
  });
}