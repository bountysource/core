with (scope('Signin','App')) {

  route('#signin', function() {
    if (logged_in()) return set_route('#');

    render(
      breadcrumbs(a({ href: '#' }, 'Home'), 'Sign In'),

      div({ style: 'text-align: center' },
        h1("Sign In to BountySource using:"),
        div({ style: 'margin: 20px 0' },
          a({ 'class': "btn-auth btn-github large hover", style: 'margin-right: 20px', href: Github.auth_url() }, "GitHub"),
          a({ 'class': "btn-auth btn-facebook large", style: 'margin-right: 20px', href: Facebook.auth_url() }, "Facebook"),
          a({ 'class': "btn-auth btn-twitter large", style: 'margin-right: 20px', href: Twitter.auth_url() }, "Twitter"),
          a({ 'class': "btn-auth btn-email large", style: 'margin-right: 20px', href: '#signin/email' }, "Email Address")
        ),
        p("We will never sell your email address or post anything without your permission!")
      )

    );
  });

  ///////////////////////////////////////////////////////////////////

  route('#signin/email', function() {
    if (logged_in()) return set_route('#');

    render(
      breadcrumbs(a({ href: '#' }, 'Home'), a({ href: '#signin' }, 'Sign In'), 'Email Address'),
      h1("Sign In with your Email Address"),
      p("Please enter your email address and a password. If you don't have a BountySource account yet, we'll create one for you."),

      super_signin_form(get_params())
    );
  });

  define('super_signin_form', function(params) {
    var refs = {};

    refs.email_is_registered = null;
    if (params.email) {
      if (typeof(params.email_is_registered) == 'boolean') {
        refs.email_is_registered = params.email_is_registered;
      } else {
        setTimeout(curry(process_email_address_changed,refs), 0);
      }
    }

    refs.error_div = div();

    refs.email_status_div = div({ style: 'margin-left: 175px; font-size: 11px; font-style:italic' });

    refs.sign_in_up_button = submit({ 'class': 'green no-hover' }, 'Continue');

    refs.account_link_id = params.account_link_id;

    refs.email = text({ name: 'email', placeholder: 'john.doe@gmail.com', value: params.email, onChange: curry(process_email_address_changed, refs) });

    refs.email_fieldset = fieldset(
      label('Email:'),
      refs.email,
      refs.email_status_div
    );

    refs.password_label = label('Password:');

    refs.password_fieldset = fieldset(
      refs.password_label,
      password({ name: 'password', 'class': 'shortish', placeholder: 'abc123' })
    );

    refs.first_and_last_name_fieldset = fieldset(
      label('First and Last Name:'),
      text({ name: 'first_name', 'class': 'shortish', placeholder: 'John', value: params.first_name||'' }),
      text({ name: 'last_name', 'class': 'shortish', placeholder: 'Doe', value: params.last_name||'' })
    );

    refs.display_name_fieldset = fieldset(
      label('Display Name:'),
      text({ name: 'display_name', placeholder: 'john.doe', value: params.display_name||(params.email && params.email.split('@')[0])||'' }),
      params.avatar_url && img({ src: params.avatar_url, style: "vertical-align: middle; width: 42px; height: 42px" })
    );

    refs.signup_fields = div(
      refs.first_and_last_name_fieldset,
      refs.display_name_fieldset
    );

    refs.button_fieldset = fieldset({ 'class': 'no-label '},
      refs.sign_in_up_button
    );

    auto_adjust_super_form_fields(refs);

    return form({ 'class': 'fancy', action: curry(process_signin_form, refs) },
      refs.account_link_id && hidden({ name: 'account_link_id', value: refs.account_link_id }),

      refs.error_div,
      refs.account_link_hidden,
      refs.email_fieldset,
      refs.password_fieldset,
      refs.signup_fields,
      refs.button_fieldset
    );
  });

  define('auto_adjust_super_form_fields', function(refs) {
    // email help text
    if (refs.email_is_registered == null) render({ into: refs.email_status_div });
    else if (refs.email_is_registered == true) render({ into: refs.email_status_div }, "Email address found. Enter your password to Sign In.");
    else if (refs.email_is_registered == false) render({ into: refs.email_status_div }, "Email address not yet registered.");

    // password is visible unless sign up with linked account
    (refs.account_link_id && refs.account_link_id.match(/^(github|facebook|twitter):/) && !refs.email_is_registered ? hide : show)(refs.password_fieldset);
    render({ into: refs.password_label }, refs.email_is_registered == false ? 'Create Password:' : 'Password:');

    // signup fields visible only if email isn't registered
    (refs.email_is_registered == false ? show : hide)(refs.signup_fields);

    // text on the submit button
    if (refs.email_is_registered == null) refs.sign_in_up_button.value = 'Continue';
    else if (refs.email_is_registered == true) refs.sign_in_up_button.value = 'Sign In';
    else if (refs.email_is_registered == false) refs.sign_in_up_button.value = 'Sign Up';
  });

  define('process_email_address_changed', function(refs) {
    refs.sign_in_up_button.disabled = true;
    BountySource.login({ email: refs.email.value }, function(response) {
      refs.sign_in_up_button.disabled = false;
      refs.email_is_registered = response.data.email_is_registered;
      auto_adjust_super_form_fields(refs);
    });
  });

  define('save_user_data_and_redirect', function(response) {
    var redirect_url = null;
    var params = get_params();

    if (response.data.redirect_url) {
      redirect_url = response.data.redirect_url;
      delete response.data.redirect_url;
    } else if (params.redirect_url) {
      redirect_url = params.redirect_url;
    } else if (Storage.get('_redirect_to_after_login')) {
      redirect_url = Storage.get('_redirect_to_after_login');
      Storage.clear('_redirect_to_after_login');
    } else {
      redirect_url = '#';
    }

    BountySource.set_access_token(response.data);
    set_route(redirect_url, { reload_page: true });
  });

  define('process_signin_form', function(refs, form_data) {
    render({ into: refs.error_div });

    BountySource.login(form_data, function(response) {
      if (response.meta.success) {
        save_user_data_and_redirect(response);
      } else if (!response.data.email_is_registered && is_visible(refs.signup_fields)) {
        // email isn't registered and the signup fields were visible when they clicked... try to create an account
        BountySource.create_account(form_data, function(response) {
          if (response.meta.success) {
            save_user_data_and_redirect(response);
          } else {
            render({ into: refs.error_div }, error_message(response.data.error));
          }
        });
      } else {
        // failed login?
        if (response.data.email_is_registered && is_visible(refs.password_fieldset)) {
          render({ into: refs.error_div },
            error_message(
              "The password you entered is incorrect.  If you don't know what it is, you can ",
              a({ style: 'text-decoration: underline', href: curry(send_password_reset_email, refs, form_data.email) }, "reset your password via email"), '.'
            )
          );
        }

        refs.email_is_registered = response.data.email_is_registered;
        auto_adjust_super_form_fields(refs);
      }
    });
  });

  define('send_password_reset_email', function(refs, email) {
    BountySource.request_password_reset({ email: email }, function(response) {
      if (response.meta.success) {
        render({ into: refs.error_div }, success_message('Password reset email has been sent.'));
      } else {
        render({ into: refs.error_div }, error_message(response.data.error));
      }
    });
  });

  ///////////////////////////////////////////////////////////////////

  route('#signin/reset', function() {
    if (logged_in()) return set_route('#');

    var error_div = div();
    var params = get_params();
    render(
      breadcrumbs(a({ href: '#' }, 'Home'), a({ href: '#signin' }, 'Sign In'), 'Reset Password'),
      h1("Enter a new password for your account"),

      error_div,

      form({ 'class': 'fancy', action: curry(reset_password, error_div) },
        fieldset(
          label('Email:'),
          span({ 'class': 'big_text' }, params.email),
          hidden({ name: 'email', value: params.email })
        ),

        fieldset(
          label('Reset Code:'),
          span({ 'class': 'big_text' }, params.code),
          hidden({ name: 'code', value: params.code })
        ),

        fieldset(
          label('New Password:'),
          password({ name: 'new_password', 'class': 'shortish', placeholder: 'abc123' })
        ),

        fieldset({ 'class': 'no-label '},
          submit({ 'class': 'green no-hover' }, 'Reset Password')
        )
      )
    );
  });

  define('reset_password', function(error_div, form_data) {
    render({ into: error_div });

    BountySource.reset_password(form_data, function(response) {
      if (response.meta.success) {
        process_signin_form(error_div, { email: form_data.email, password: form_data.new_password });
      } else {
        render({ into: error_div }, error_message(response.data.error));
      }
    })
  });

  ///////////////////////////////////////////////////////////////////

  route('#auth/:provider', function(provider) {
    var params = get_params();

    if (params.status == 'linked') {
      // now they're logged in with this github account
      save_user_data_and_redirect({ data: params.access_token });
    } else if (params.status == 'error_needs_account') {
      render(
        breadcrumbs(a({ href: '#' }, 'Home'), 'Sign In'),
        h1("Last step to Sign In"),
        super_signin_form(params)
      );
    } else if (params.status == 'error_already_linked') {
      render('ERROR: Account already linked.');
    } else {
      render('ERROR: Unknown status.');
    }
  });

}