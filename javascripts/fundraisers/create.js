with (scope('Fundraisers')) {
  // create a new fundraiser
  route('#account/create_fundraiser', function() {
    render(
      breadcrumbs(
        'Home',
        a({ href: '#account' }, 'Account'),
        a({ href: '#account/fundraisers' }, 'Fundraisers'),
        'Create'
      ),

      messages(),

      div({ 'class': 'split-main' },
        form({ 'class': 'fancy', action: create_fundraiser },
          fieldset(
            label('Title:'),
            input({ 'class': 'long', name: 'title', placeholder: 'My Awesome Project' })
          ),

          fieldset({ 'class': 'no-label' },
            submit({ 'class': 'green' }, 'Create Fundraiser')
          )
        )
      ),

      div({ 'class': 'split-side' },
        grey_box("A fundraiser is a way to raise money for the development of an open source project.")
      ),

      div({ 'class': 'split-end' })
    );
  });

  define('create_fundraiser', function(form_data) {
    BountySource.create_fundraiser(form_data, function(response) {
      if (response.meta.success) {
        set_route('#account/fundraisers/'+response.data.id)
      } else {
        render_message(error_message(response.data.error));
      }
    });
  });
}