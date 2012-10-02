with (scope('Account','App')) {
  route('#account/change_password', function() {
    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#account' }, 'Account'),
        'Change Password'
      ),

      form({ 'class': 'fancy', action: change_password },
        messages(),

        fieldset(
          label('Current Password:'),
          password({ name: 'current_password', placeholder: '123abc' })
        ),
        fieldset(
          label('New Password:'),
          password({ name: 'new_password', placeholder: 'abc123' })
        ),
        fieldset(
          label('Confirm Password:'),
          password({ name: 'password_confirmation', placeholder: 'abc123' })
        ),

        fieldset({ 'class': 'no-label' },
          submit({ 'class': 'green' }, 'Change Password')
        )
      )
    );
  });

  define('change_password', function(form_data) {
    clear_message();
    BountySource.change_password(form_data, function(response) {
      document.getElementsByTagName('input[type=password]')
      if (response.meta.success) {
        render_message(success_message('Password changed!'));
      } else {
        render_message(error_message(response.data.error));
      }
    })
  });
};