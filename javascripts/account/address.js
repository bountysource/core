with (scope('Account','App')) {
  route('#account/address', function() {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#account' }, 'Account'),
        'Address'
      ),
      target_div
    );

    BountySource.basic_user_info(function(response) {
      var mailing_address = (response.data||{}).mailing_address;

      render({ into: target_div },
        form({ 'class': 'fancy', action: mailing_address ? update_mailing_address : create_mailing_address },
          messages(),

          fieldset(
            label('First Name:'),
            text({ name: 'first_name', placeholder: 'John', value: mailing_address.first_name||'' })
          ),
          fieldset(
            label('Last Name:'),
            text({ name: 'last_name', placeholder: 'Doe', value: mailing_address.last_name||'' })
          ),
          fieldset(
            label('Address:'),
            text({ 'class': 'long', name: 'address1', placeholder: '548 Market Street', value: mailing_address.address1||'' })
          ),
          fieldset({ 'class': 'no-label' },
            text({ 'class': 'long', name: 'address2', placeholder: 'Suite 42', value: mailing_address.address2||'' })
          ),
          fieldset(
            label('City:'),
            text({ name: 'city', placeholder: 'San Francisco', value: mailing_address.city||'' })
          ),
          fieldset(
            label('State:'),
            text({ name: 'state', placeholder: 'California', value: mailing_address.state||'' })
          ),
          fieldset(
            label('Postal Code:'),
            text({ name: 'postal_code', placeholder: '94104-5401', value: mailing_address.postal_code||'' })
          ),
          fieldset(
            label('Country:'),
            text({ name: 'country', placeholder: 'US', value: mailing_address.country||'' })
          ),

        fieldset({ 'class': 'no-label' },
            submit({ 'class': 'green' }, 'Create/Update Address')
          )
        )
      )
    });
  });

  define('create_or_update_mailing_address', function(form_data) {
    BountySource.basic_user_info(function(response) {
      if (response.data.mailing_address)
        update_mailing_address(form_data);
      else
        create_mailing_address(form_data);
    });
  });

  define('create_mailing_address', function(form_data) {
    BountySource.create_mailing_address(form_data, function(response) {
      if (response.meta.success) {
        render_message(success_message('Address created.'));
      } else {
        render_message(error_message(response.data.error));
      }
    });
  });

  define('update_mailing_address', function(form_data) {
    BountySource.update_mailing_address(form_data, function(response) {
      if (response.meta.success) {
        render_message(success_message('Address updated.'));
      } else {
        render_message(error_message(response.data.error));
      }
    });
  });
};