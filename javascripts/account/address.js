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
      var address = (response.data.address||{});

      render({ into: target_div },
        form({ 'class': 'fancy', action: address ? update_address : create_address },
          messages(),

          fieldset(
            label('First Name:'),
            text({ name: 'first_name', placeholder: 'John', value: address.first_name||'' })
          ),
          fieldset(
            label('Last Name:'),
            text({ name: 'last_name', placeholder: 'Doe', value: address.last_name||'' })
          ),
          fieldset(
            label('Address:'),
            text({ 'class': 'long', name: 'address1', placeholder: '548 Market Street', value: address.address1||'' })
          ),
          fieldset({ 'class': 'no-label' },
            text({ 'class': 'long', name: 'address2', placeholder: 'Suite 42', value: address.address2||'' })
          ),
          fieldset(
            label('City:'),
            text({ name: 'city', placeholder: 'San Francisco', value: address.city||'' })
          ),
          fieldset(
            label('State:'),
            text({ name: 'state', placeholder: 'California', value: address.state||'' })
          ),
          fieldset(
            label('Postal Code:'),
            text({ name: 'postal_code', placeholder: '94104-5401', value: address.postal_code||'' })
          ),
          fieldset(
            label('Country:'),
            text({ name: 'country', placeholder: 'US', value: address.country||'' })
          ),

        fieldset({ 'class': 'no-label' },
            submit({ 'class': 'green' }, 'Create/Update Address')
          )
        )
      )
    });
  });

  define('create_or_update_address', function(form_data) {
    BountySource.basic_user_info(function(response) {
      if (response.data.address)
        update_address(form_data);
      else
        create_address(form_data);
    });
  });

  define('create_address', function(form_data) {
    BountySource.create_address(form_data, function(response) {
      if (response.meta.success) {
        render_message(success_message('Address created.'));
      } else {
        render_message(error_message(response.data.error));
      }
    });
  });

  define('update_address', function(form_data) {
    BountySource.update_address(form_data, function(response) {
      if (response.meta.success) {
        render_message(success_message('Address updated.'));
      } else {
        render_message(error_message(response.data.error));
      }
    });
  });
};