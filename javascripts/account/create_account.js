with (scope('CreateAccount','App')) {
  route('#create_account', function() {
    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'Account',
        'Create'
      ),

      div({ 'class': 'split-main' },
        form({ 'class': 'fancy', action: create_account },
          messages(),

          fieldset(
            label('First Name:'),
            text({ name: 'first_name', placeholder: 'John' })
          ),
          fieldset(
            label('Last Name:'),
            text({ name: 'last_name', placeholder: 'Doe' })
          ),
          fieldset(
            label('Display Name:'),
            text({ name: 'display_name', placeholder: 'John S. Doe' }),
            small(' (optional)')
          ),
          fieldset(
            label('Email:'),
            text({ 'class': 'long', name: 'email', placeholder: 'john.doe@gmail.com' })
          ),
          fieldset(
            label('Password:'),
            password({ name: 'password', placeholder: 'abcd1234'})
          ),
          fieldset(
            label('Confirm Password:'),
            password({ name: 'password_confirmation', placeholder: 'abcd1234'})
          ),
//          fieldset({ 'class': 'no-label' },
//            checkbox({ style: 'padding-right: 10px;', name: 'agree_to_terms' }),
//            span('I agree to the BountySource ', a({ href: '#create_account' }, 'terms of agreement'))
//          ),
          fieldset({ 'class': 'no-label' },
            submit({ 'class': 'green' }, 'Create Account')
          )
        )
      ),

      div({ 'class': 'split-side' },
        div({ style: 'background: #eee; border: 1px solid #ccc; margin-right: 20px; padding: 20px' },
          h2({ style: 'text-transform: uppercase; color: #5e5f5f; font-size: 21px; text-align: center; font-weight: normal; margin: 0 auto 15px auto; line-height: 25px;' }, 'Already Have an Account?'),
          a({ 'class': 'blue', href: '#login' }, 'Login')
        )
      ),

      div({ 'class': 'split-end' })
    )
  });

  define('create_account', function(form_data) {
    clear_message();
    // convert 'on/off' value of checkbox to boolean
    form_data.agree_to_terms = form_data.agree_to_terms == 'on';
    BountySource.create_account(form_data, function(response) {
      if (response.meta.success) {
        Storage.set('access_token', response.data.access_token);
        set_route('#');
      } else {
        render_message(error_message(response.data.error));
      }
    });
  })
};
