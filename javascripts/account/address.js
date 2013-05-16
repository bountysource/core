with (scope('Account','App')) {
  // generic form, to make create, update, and create/update forms
  define('base_address_form', function(options) {
    return form({ 'class': 'fancy', action: function(form_data) { options.action(form_data, (options.callback||function(){})) } },
      fieldset(
        label('First & Last Names:'),
        text({ style: 'margin-right: 10px;', name: 'first_name', placeholder: 'John' }),
        text({ name: 'last_name', placeholder: 'Doe' })
      ),
      fieldset(
        label('Address:'),
        text({ 'class': 'long', name: 'address1', placeholder: '548 Market Street' })
      ),
      fieldset({ 'class': 'no-label' },
        text({ 'class': 'long', name: 'address2', placeholder: 'Suite 42' })
      ),
      fieldset(
        label('City & State:'),
        text({ style: 'margin-right: 10px;', name: 'city', placeholder: 'San Francisco' }),
        text({ name: 'state', placeholder: 'California' })
      ),
      fieldset(
        label('Postal Code:'),
        text({ name: 'postal_code', placeholder: '94104-5401' })
      ),
      fieldset(
        label('Country:'),
        text({ name: 'country', placeholder: 'US' })
      ),
      fieldset({ 'class': 'no-label' },
        submit({ 'class': 'button green' }, options.submit_label)
      )
    );
  });

  define('create_address_form', function(callback) {
    return base_address_form({ action: create_address, submit_label: 'Create Address', callback: callback });
  });

  define('update_address_form', function(callback) {
    var dat_form = base_address_form({ action: update_address, submit_label: 'Update Address', callback: callback });

    Bountysource.basic_user_info(function(response) {
      var address = (response.data.address||{});
      document.getElementsByName('first_name')[0].value = address.first_name||'';
      document.getElementsByName('last_name')[0].value = address.last_name||'';
      document.getElementsByName('address1')[0].value = address.address1||'';
      document.getElementsByName('address2')[0].value = address.address2||'';
      document.getElementsByName('city')[0].value = address.city||'';
      document.getElementsByName('state')[0].value = address.state||'';
      document.getElementsByName('postal_code')[0].value = address.postal_code||'';
      document.getElementsByName('country')[0].value = address.country||'';
    });

    return dat_form;
  });

  define('create_or_update_address_form', function(callback) {
    var dat_form = base_address_form({ action: create_or_update_address, submit_label: 'Create/Update Address', callback: callback });

    Bountysource.basic_user_info(function(response) {
      var address = (response.data.address||{});
      document.getElementsByName('first_name')[0].value = address.first_name||'';
      document.getElementsByName('last_name')[0].value = address.last_name||'';
      document.getElementsByName('address1')[0].value = address.address1||'';
      document.getElementsByName('address2')[0].value = address.address2||'';
      document.getElementsByName('city')[0].value = address.city||'';
      document.getElementsByName('state')[0].value = address.state||'';
      document.getElementsByName('postal_code')[0].value = address.postal_code||'';
      document.getElementsByName('country')[0].value = address.country||'';
    });

    return dat_form;
  });

  define('create_or_update_address', function(form_data, callback) {
    Bountysource.basic_user_info(function(response) {
      if (response.data.address) {
        update_address(form_data, callback);
      } else {
        create_address(form_data, callback);
      }
      callback(response);
    });
  });

  define('create_address', function(form_data, callback) {
    Bountysource.create_address(form_data, callback || function(response) {
      if (response.meta.success) {
        render_message(success_message('Address created.'));
      } else {
        render_message(error_message(response.data.error));
      }
      callback(response);
    });
  });

  define('update_address', function(form_data, callback) {
    Bountysource.update_address(form_data, callback || function(response) {
      if (response.meta.success) {
        render_message(success_message('Address updated.'));
      } else {
        render_message(error_message(response.data.error));
      }
      callback(response);
    });
  });
};