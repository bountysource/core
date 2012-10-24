with (scope('Login', 'App')) {
  route('#login', function() {
    if (logged_in()) {
      set_route('#');
      return;
    }
    
    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'Account',
        'Login'
      ),

      messages(),
      
      div({ style: 'width: 415px; height: 320px; background: #eee; border: 1px solid #ccc; float: left; margin-right: 20px; padding: 20px' },
        h2({ style: 'text-transform: uppercase; color: #5e5f5f; font-size: 21px; text-align: center; font-weight: normal; margin-bottom: 10px' }, 'Have a GitHub Account?'),
        div({ style: 'width: 200px; margin: 0 auto' },
          img({ src: 'images/github.png' }),
          br(),
          Github.link_requiring_auth({ href: (Storage.get('_redirect_to_after_login') || '#'), 'class': 'green' }, 'Login with GitHub')
        )
      ),
      
      div({ id: 'login-div', style: 'width: 415px; height: 320px; background: #eee; border: 1px solid #ccc; float: left; padding: 20px' },
        h2({ style: 'text-transform: uppercase; color: #5e5f5f; font-size: 21px; text-align: center; font-weight: normal; margin-bottom: 10px' }, 'Have a BountySource Account?'),
        form({ action: login, style: 'width: 200px; margin: 40px auto 0' }, 
          
          div({ style: 'color: #999' }, "EMAIL:"),
          div({ style: 'margin-bottom: 15px' }, text({ style: 'width: 180px; border: 1px solid #ccc; font-size: 18px; line-height: 18px; padding: 0 10px; height: 40px', name: 'email', placeholder: 'john.doe@gmail.com' })),

          div({ style: 'color: #999' }, "PASSWORD:"),
          div({ style: 'margin-bottom: 15px' }, password({ style: 'width: 180px; border: 1px solid #ccc; font-size: 18px; line-height: 18px; padding: 0 10px; height: 40px', name: 'password', placeholder: 'abc123'})),
          div({ style: 'margin-top: 39px' }, submit({ 'class': 'green' }, 'Login')),

          br(),

          div({ style: 'text-align: center; font-size: 12px;' }, a({ href: resize_for_password_reset_form }, 'Forgot your password?'))
        ),

        form({ id: 'password-reset-form', action: request_password_reset, style: 'width: 200px; margin: 40px auto 0; display: none;' },
          p("Provide us with the information below, and we will send you an email with password reset instructions."),

          div({ style: 'color: #999' }, "ACCOUNT EMAIL:"),
          div({ style: 'margin-bottom: 15px' }, text({ style: 'width: 180px; border: 1px solid #ccc; font-size: 18px; line-height: 18px; padding: 0 10px; height: 40px', name: 'email', placeholder: 'john.doe@gmail.com' })),

          div({ style: 'margin-top: 39px' }, submit({ 'class': 'green' }, 'Send Email'))
        )
      ),
      
      div({ style: 'clear: both' })
    );
  });

  define('login', function(form_data) {
    BountySource.login(form_data.email, form_data.password, function(response) {
      if (response.meta.success) {
        Storage.set('access_token', response.data.access_token);
        set_route(Storage.remove('_redirect_to_after_login') || '#', { reload_page: true });
      } else {
        render_message(error_message(response.data.error));
      }
    });
  });

  define('request_password_reset', function(form_data) {
    BountySource.request_password_reset(form_data, function(response) {
      if (response.meta.success) {
        render_message(success_message('Password reset email sent.'));
      } else {
        render_message(error_message(response.data.error));
      }
    });
  });

  define('resize_for_password_reset_form', function() {
    document.getElementById('password-reset-form').style.display = '';
    document.getElementById('login-div').style.height = '620px';
  });

  route('#reset_password', function(code) {
    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'Account',
        'Reset Password'
      ),

      messages(),

      form({ 'class': 'fancy', action: reset_password },
        fieldset(
          label('Account Email:'),
          text({ name: 'email', placeholder: 'john.doe@gmail.com', value: code||'' })
        ),
        fieldset(
          label('Code:'),
          text({ name: 'code', placeholder: 'abc123456789', value: code||'' })
        ),
        fieldset(
          label('New Password:'),
          password({ name: 'new_password', placeholder: 'abc123' })
        ),
        fieldset(
          label('Confirm New Password:'),
          password({ name: 'new_password_confirmation', placeholder: 'abc123' })
        ),

        fieldset({ 'class': 'no-label' },
          submit({ 'class': 'green' }, 'Reset Password')
        )
      )
    )
  });

  define('reset_password', function(form_data) {
    BountySource.reset_password(form_data, function(response) {
      console.log(response);

      if (response.meta.success) {
        render_message(success_message('Password Reset!'));
      } else {
        render_message(error_message(response.data.error));
      }
    })
  });
}