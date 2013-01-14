with (scope('Paypal', 'Account')) {
  define('link_account', function(callback) {
    return form({ 'class': 'fancy', action: function(form_data) { link_paypal_account(form_data, (callback||function(){})); } },
      fieldset(
        label('PayPal Email:'),
        text({ 'class': 'long', name: 'paypal_email', placeholder: 'john.doe@gmail.com' })
      ),
      fieldset(
        label('Confirm Email:'),
        text({ 'class': 'long', name: 'paypal_email_confirmation', placeholder: 'john.doe@gmail.com' })
      ),
      fieldset({ 'class': 'no-label' },
        submit({ 'class': 'green' }, 'Link Paypal Account')
      )
    );
  });

  define('link_paypal_account', function(form_data, callback) {
    BountySource.link_paypal_account(form_data, callback || function(response) {
      if (response.meta.success) {
        render_message(success_message('Paypal account linked!'));
      } else {
        render_message(error_message(response.data.error));
      }
      callback(response);
    });
  });
}