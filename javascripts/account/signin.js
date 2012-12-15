with (scope('SignIn', 'App')) {
  route('#signin', function() {
    if (logged_in()) {
      set_route('#');
      return;
    }

    var params = get_params();

    render(
      div({ style: 'display: inline-block; width: 540px; margin-right: 25px; padding-right: 24px; vertical-align: top; text-align: center; border-right: 1px solid #E0E0E0;' },
        div({ style: 'padding-bottom; 15px; margin-bottom: 39px;' },
          img({ src: 'images/github.png', style: 'height: 100px; vertical-align: middle; margin-right: 15px;' }),
          a({ 'class': 'btn-auth btn-github large hover', style: 'display: inline-block; vertical-align: middle;',  href: Github.auth_url() }, 'Sign in with GitHub')
        ),

        fancy_header('or with a BountySource account'),

        div({ style: 'margin-top: 45px;' },
          form({ id: 'login-form', 'class': 'fancy', action: login },
            div({ id: 'login-messages' }),

            input({ id: 'login-email', style: 'width: 245px; font-size: 14px; margin-right: 10px;', name: 'email', placeholder: 'Email address' }),
            password({ style: 'width: 150px; font-size: 14px; margin-right: 10px;', name: 'password', placeholder: 'Password' }),
            submit({ 'class': 'green', style: 'width: 80px;' },'Sign In'),
            div({ style: 'text-align: right; margin-top: 3px;' },
              a({ href: show_forgot_password_form, style: 'color: black; font-size: 12px;' }, 'forgot your password?')
            )
          ),

          form({ id: 'request-password-reset-form', 'class': 'fancy', style: 'display: none;', action: request_password_reset },
            div({ id: 'request-password-reset-messages' }),

            input({ id: 'request-password-reset-email', style: 'width: 408px; font-size: 14px; margin-right: 10px;', name: 'email', placeholder: 'Email address' }),
            submit({ 'class': 'green', style: 'width: 100px;' }, 'Send Email'),
            div({ style: 'text-align: right; margin-top: 3px;' },
              a({ href: hide_forgot_password_form, style: 'color: black; font-size: 12px;' }, 'cancel')
            )
          )
        )
      ),

      div({ style: 'display: inline-block; width: 365px; vertical-align: middle;' },
        fancy_header('CREATE ACCOUNT'),

        form({ 'class': 'fancy', action: create_account },
          div({ id: 'create-account-messages' }),

          div({ style: 'margin-bottom: 10px;' },
            input({ style: 'margin-right: 10px; width: 130px; display: inline-block;', name: 'first_name', placeholder: 'First name', value: params.first_name||'' }),
            input({ style: 'width: 130px; display: inline-block;', name: 'last_name', placeholder: 'Last name', value: params.last_name||'' })
          ),
          div({ style: 'margin-bottom: 10px;' },
            input({ style: 'width: 292px;', name: 'email', placeholder: 'Your email address', value: params.email||'' })
          ),
          div({ style: 'margin-bottom: 10px;' },
            password({ name: 'password', placeholder: 'Choose a password', value: params.password||'' })
          ),

          submit({ 'class': 'green no-hover' }, 'Sign up')
        )
      )
    );
  });

  define('show_forgot_password_form', function() {
    show('request-password-reset-form');
    hide('login-form');

    var login_email_input                   = document.getElementById('login-email'),
        request_password_reset_email_input  = document.getElementById('request-password-reset-email');

    request_password_reset_email_input.value = login_email_input.value;
    request_password_reset_email_input.focus();
  });

  define('hide_forgot_password_form', function() {
    hide('request-password-reset-form');
    show('login-form');
  });

  define('fancy_header', function() {
    return h2({ style: 'color: #5e5f5f; font-size: 21px; text-align: center; font-weight: normal; margin-bottom: 10px' }, arguments);
  });

  define('login', function(form_data) {
    render({ target: 'login-messages' },'');

    BountySource.login(form_data.email, form_data.password, function(response) {
      if (response.meta.success) {
        // set access token
        Storage.set('access_token', response.data.access_token);

        // store user_info at login
        BountySource.set_cached_user_info(response.data);

        // redirect to a stored route, if one has been set.
        redirect_to_saved_route();
      } else {
        render({ target: 'login-messages' }, error_message(response.data.error));
      }
    });
  });

  define('create_account', function(form_data) {
    console.log(form_data);
  });

  define('request_password_reset', function(form_data) {
    BountySource.request_password_reset(form_data, function(response) {
      if (response.meta.success) {
        render({ target: 'request-password-reset-messages' }, success_message('Password reset email has been sent.'));
      } else {
        render({ target: 'request-password-reset-messages' }, error_message(response.data.error));
      }
    });
  });

  define('resize_for_password_reset_form', function() {
    document.getElementById('password-reset-form').style.display = '';
    document.getElementById('login-div').style.height = '620px';
  });

  route('#reset_password', function() {
    var params = get_params();

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
          text({ name: 'email', 'class': 'long', placeholder: 'john.doe@gmail.com', value: params.email||'' })
        ),
        fieldset(
          label('Code:'),
          text({ name: 'code', placeholder: 'abc123456789', value: params.code||'' })
        ),
        fieldset(
          label('New Password:'),
          password({ name: 'new_password', placeholder: 'abc123' })
        ),

        fieldset({ 'class': 'no-label' },
          submit({ 'class': 'green' }, 'Reset Password')
        )
      )
    );
  });

  define('reset_password', function(form_data) {
    BountySource.reset_password(form_data, function(response) {
      if (response.meta.success) {
        render_message(success_message('Password has been changed.'));
      } else {
        render_message(error_message(response.data.error));
      }
    })
  });
}