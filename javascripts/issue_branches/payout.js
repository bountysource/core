with (scope('Payout','IssueBranch')) {
  route('#repos/:login/:repository/issues/:issue_number/issue_branch/payout', function(login, repository, issue_number) {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#repos/' + login + '/' + repository }, login + '/' + repository),
        a({ href: '#repos/' + login + '/' + repository + '/issues' }, 'Issues'),
        a({ href: '#repos/' + login + '/' + repository + '/issues/' + issue_number }, '#' + issue_number),
        a({ href: '#repos/' + login + '/' + repository + '/issues/' + issue_number + '/issue_branch' }, 'Issue Branch'),
        ('Payment Details')
      ),

      target_div
    );

    Issue.get_solution(login, repository, issue_number, function(solution) {
      if (!solution || !solution.accepted) {
        render({ into: target_div },
          error_message("You have not earned this bounty. Get back to work!")
        );
      } else {
        render({ into: target_div },
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
      }
    });
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
    var target_div = div('Loading...');

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
      target_div
    );

    Issue.get_solution(login, repository, issue_number, function(solution) {
      console.log(solution)

      var bounty_total = parseInt(solution.issue.account_balance),
          bounty_source_tax = parseFloat(solution.bounty_source_tax),
          project_tax = parseFloat(solution.issue.repository.project_tax);



//      if (!solution || !solution.accepted) {
      if (false) {
        render({ into: target_div },
          error_message("You have not earned this bounty. Get back to work!")
        );
      } else {
        render({ into: target_div },
          form({ 'class': 'fancy', action: claim_bounty },
            fieldset({ style: 'padding: 10px 0;' },
              label('Total Bounty:'),
              div({ id: 'bounty-amount', style: 'font-size: 30px; display: inline; vertical-align: middle;' }, money(bounty_total))
            ),

            grey_box(
              h2({ style: 'text-transform: uppercase; color: #5e5f5f; font-size: 21px; text-align: center; font-weight: normal; margin-bottom: 10px' }, 'Donations'),

              fieldset(
                label('Project:'),
                donation_slider({ 'data-tax': project_tax, style: 'width: 500px;', name: 'project' }),
                project_tax > 0 && p({ style: 'font-style: italic; font-size: 12px;' }, '*This project requires a minimum donation.')
              ),
              fieldset(
                label('Charity:'),
                donation_slider({ style: 'width: 500px;', name: 'charity' })
              ),
              fieldset(
                label('BountySource:'),
                donation_slider({ 'data-tax': bounty_source_tax, style: 'width: 500px;', name: 'bountysource' }),
                p({ style: 'font-style: italic; font-size: 12px; width: 350px;' }, '*BountySource receives a small portion of your earnings, but you can donate more if you want.')
              )
            ),

            fieldset({ style: 'padding: 10px 0;' },
              label('Total Donations:'),
              div({ id: 'donation-total', style: 'font-size: 30px; display: inline; vertical-align: middle;' }, money((bounty_total*project_tax) + (bounty_total*bounty_source_tax)))
            ),
            fieldset({ style: 'padding: 10px 0;' },
              label('Your Cut:'),
              div({ id: 'total-cut', style: 'font-size: 30px; display: inline; vertical-align: middle;' }, money(bounty_total - ((bounty_total*project_tax) + (bounty_total*bounty_source_tax))))
            ),
            fieldset({ 'class': 'no-label' },
              submit({ 'class': 'green' }, 'Claim Bounty')
            )
          )
        );

        // group dem ranges together
        var donation_sliders = donation_slider_group({ max: bounty_total }, 'project', 'charity', 'bountysource');

        update_font_size(document.getElementById('donation-total'), (bounty_total*project_tax) + (bounty_total*bounty_source_tax), bounty_total);
        update_font_size(document.getElementById('total-cut'), bounty_total - ((bounty_total*project_tax) + (bounty_total*bounty_source_tax)), bounty_total);

        // watch all sliders for change to update the donations field
        for (var i in donation_sliders) {
          donation_sliders[i].addEventListener('change', function(e) {
            // sum of donations
            var donation_sum = 0;
            for (var j in donation_sliders) donation_sum += parseInt(donation_sliders[j].value);
            document.getElementById('donation-total').innerHTML = money(donation_sum);

            // which makes your cut the difference of donations and the bounty
            document.getElementById('total-cut').innerHTML = money(bounty_total - donation_sum);

            // update the font sizes
            update_font_size(document.getElementById('donation-total'), donation_sum, bounty_total)
            update_font_size(document.getElementById('total-cut'), (bounty_total - donation_sum), bounty_total)
          });
        }
      }
    });
  });

  define('update_font_size', function(element, current, max, min_font_size, max_font_size) {
    max_font_size = max_font_size || 40;
    min_font_size = min_font_size || 20;
    element.style['font-size'] = min_font_size + ((current/max) * (max_font_size - min_font_size))+'px';
  });

  define('claim_bounty', function(form_data) {
    if (confirm('Are you sure?')) {
      console.log(form_data);
    }
  });
}