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

      console.log(info);

      render({ into: target_div },
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

          fieldset({ 'class': 'no-label' },
            submit({ 'class': 'green' }, 'Update Account')
          )
        )
      );

      if (!(info.first_name || info.last_name || info.email)) {
        render_message(info_message("Your account is not complete! In order to fully use BountySource, you will need a completed account."));
      }
    });
  });

  define('update_account', function(form_data) {
    clear_message();
    BountySource.update_account(form_data, function(response) {
      if (response.meta.success) {
        render_message(success_message('Account updated!'));
      } else {
        render_message(error_message(response.data.error));
      }
    });
  });
};