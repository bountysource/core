with (scope('Account','App')) {
  route('#account', function() {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'Account'
      ),
      target_div
    );

    BountySource.basic_user_info(function(response) {
      var info = response.data;

      // if filler data set to create account, delete out of info
      // so that the 'complete your profile' message shows up
      for (k in info) if (info[k] == '__undefined__') delete info[k];

      render({ into: target_div },

        Columns.create(),

        Columns.main(
          form({ 'class': 'fancy', action: update_account },
            h3('Bountysource Account'),

            messages(),

            required_inputs(
              fieldset(
                label('First Name:'),
                text({ name: 'first_name', placeholder: 'John', value: (info.first_name||'') })
              ),
              fieldset(
                label('Last Name:'),
                text({ name: 'last_name', placeholder: 'Doe', value: (info.last_name||'') })
              ),
              fieldset(
                label('Display Name:'),
                text({ name: 'display_name', placeholder: 'johndoe42', value: (info.display_name||'') })
              ),
              fieldset(
                label('Email:'),
                text({ 'class': 'long', name: 'email', placeholder: 'john.doe@gmail.com', value: (info.email||'') })
              )
            ),

//            fieldset(
//              label({ 'for': 'paypal_email' }, img({ style: 'display: inline-block; vertical-align: middle; margin-right: 5px;', src: 'images/paypal.png' }), span({ style: 'display: inline-block; vertical-align: middle;' }, 'Paypal Email:')),
//              email({ id: 'paypal_email', 'class': 'long', name: 'paypal_email', placeholder: 'john.doe@gmail.com', value: info.paypal_email||'' })
//            ),

            fieldset({ 'class': 'no-label' },
              submit({ 'class': 'button green', style: 'width: 250px;' }, 'Update Bountysource Account')
            )
          )
        ),

        Columns.side(
          div({ style: 'background: #eee; padding: 0 21px 21px 21px;' }, ribbon_header('Account Settings'), br(),
            a({ 'class': 'button blue', href: '#account/change_password' }, 'Change Password')
          ),

          br(),

          // show GitHub account if logged in
          div({ style: 'background: #eee; border: 1px solid #ccc; padding: 20px; text-align: center;' },
            response.data.github_account ? [
              h2({ style: 'text-transform: uppercase; color: #5e5f5f; font-size: 21px; text-align: center; font-weight: normal; margin: 0 auto 15px auto; line-height: 25px;' }, 'GitHub Account Linked'),
              img({ style: 'border: 1px solid #ccc; width: 80px;', src: response.data.github_account.avatar_url }),
              br(),
              span(response.data.github_account.login)
            ] : [
              h2({ style: 'text-transform: uppercase; color: #5e5f5f; font-size: 21px; text-align: center; font-weight: normal; margin: 0 auto 15px auto; line-height: 25px;' }, 'Have a GitHub Account?'),
              a({ 'class': 'button blue', href: Github.auth_url() }, 'Link GitHub Account')
            ]
          )
        )
      );
    });
  });

  define('update_account', function(form_data) {
    clear_message();
    BountySource.update_account(form_data, function(response) {
      if (response.meta.success) {
        if (document.getElementById('account-incomplete-message')) render({ into: 'account-incomplete-message' }, '');
        render_message(success_message('Account updated!'));
      } else {
        render_message(error_message(response.data.error));
      }
    });
  });
};