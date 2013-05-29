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
            messages(),

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
            ),

            br,

            fieldset(
              label('Public Email:'),
              email({ 'class': 'long', name: 'public_email', placeholder: 'john.doe@gmail.com', value: (info.gravatar_email||'') })
            ),
            fieldset(
              label('Location:'),
              text({ 'class': 'long', name: 'location', placeholder: 'San Francisco, CA', value: (info.location||'') })
            ),
            fieldset(
              label('Company:'),
              text({ 'class': 'long', name: 'company', placeholder: 'Dunder Mifflin', value: (info.company||'') })
            ),
            fieldset(
              label('Website:'),
              text({ 'class': 'long', name: 'url', placeholder: 'http://johndoe.net', value: (info.url||'') })
            ),

            br,

            fieldset(
              label('Gravatar Email:'),
              email({ 'class': 'long', name: 'gravatar_email', placeholder: 'john.doe@gmail.com', value: (info.gravatar_email||'') })
            ),

            fieldset({ 'class': 'no-label' },
              submit({ 'class': 'button green', style: 'width: 250px;' }, 'Update Account')
            )
          )
        ),

        Columns.side(
          div({ style: 'background: #eee; padding: 0 21px 21px 21px;' }, ribbon_header('Account Settings'), br(),
            a({ 'class': 'button blue', href: '#account/change_password' }, 'Change Password')
          ),

          br,

          div('TODO show all linked accounts')
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