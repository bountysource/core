with (scope('Paypal', 'Account')) {
  define('link_account', function(action) {
    var dat_form = form({ 'class': 'fancy', action: action || link_paypal_account },
      fieldset(
        label('Email:'),
        text({ 'class': 'long', name: 'paypal_email', placeholder: 'john.doe@gmail.com' })
      ),
      fieldset({ 'class': 'no-label' },
        submit({ 'class': 'green' }, 'Next')
      )
    );

    BountySource.basic_user_info(function(response) {
      var info = response.data;
      document.getElementsByName('paypal_email')[0].value = info.paypal_email||'';
    });

    return dat_form;
  });

  define('link_paypal_account', function(form_data, callback) {
    BountySource.update_account(form_data, callback || function(response) {
      if (response.meta.success) {
        render_message(success_message('Paypal account linked!'));
      } else {
        render_message(error_message(response.data.error));
      }
    });
  });
}