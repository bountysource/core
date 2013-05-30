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
      var person = response.data;

      // if filler data set to create account, delete out of info
      // so that the 'complete your profile' message shows up
      for (k in person) if (person[k] == '__undefined__') delete person[k];

      render({ into: target_div },

        Columns.create(),

        Columns.main(
          form({ 'class': 'fancy', action: update_account },
            messages(),

            fieldset({ 'class': 'no-label' },
              h3('Account Details')
            ),

            fieldset(
              label('First Name:'),
              text({ name: 'first_name', placeholder: 'John', value: (person.first_name||'') })
            ),
            fieldset(
              label('Last Name:'),
              text({ name: 'last_name', placeholder: 'Doe', value: (person.last_name||'') })
            ),
            fieldset(
              label('Display Name:'),
              text({ name: 'display_name', placeholder: 'johndoe42', value: (person.display_name||'') })
            ),
            fieldset(
              label('Email:'),
              text({ 'class': 'long', name: 'email', placeholder: 'john.doe@gmail.com', value: (person.email||'') })
            ),

            fieldset({ 'class': 'no-label' },
              h3('Public Profile')
            ),

            fieldset(
              label('Public Email:'),
              email({ 'class': 'long', name: 'public_email', placeholder: 'john.doe@gmail.com', value: (person.public_email||'') })
            ),
            fieldset(
              label('Location:'),
              text({ 'class': 'long', name: 'location', placeholder: 'San Francisco, CA', value: (person.location||'') })
            ),
            fieldset(
              label('Company:'),
              text({ 'class': 'long', name: 'company', placeholder: 'Dunder Mifflin', value: (person.company||'') })
            ),
            fieldset(
              label('Website:'),
              text({ 'class': 'long', name: 'url', placeholder: 'http://johndoe.net', value: (person.url||'') })
            ),

            fieldset({ 'class': 'no-label' },
              h3('Gravatar Image')
            ),

            fieldset(
              label('Gravatar Email:'),
              email({ 'class': 'long', name: 'gravatar_email', placeholder: 'john.doe@gmail.com', value: (person.gravatar_email||'') })
            ),

            fieldset({ 'class': 'no-label' },
              img({ src: person.image_url, style: 'width: 40px; height: 100%; vertical-align: middle; display: inline-block;' }),
              a({ href: 'https://gravatar.com/', style: 'vertical-align: middle; margin-left: 15px;' }, 'Change image at Gravatar.com')
            ),

            fieldset({ 'class': 'no-label' },
              h3('Settings')
            ),

            fieldset({ 'class': 'no-label' },
              checkbox({
                id: 'exclude_from_newsletter',
                checked: !person.exclude_from_newsletter,
                style: 'display: inline-block; vertical-align: middle; margin-right: 10px;'
              }),
              label({ 'for': 'exclude_from_newsletter', style: 'display: inline-block; vertical-align: middle; text-align: left; width: inherit; font-size: inherit;' }, "Receive the Bountysource newsletter")
            ),

            fieldset({ 'class': 'no-label' },
              submit({ 'class': 'button green', style: 'width: 250px;' }, 'Update Account')
            )
          )
        ),

        Columns.side(
          h3('Linked Accounts'),
          person.github_account && div({ 'class': 'profile-linked-account' },
            a({ href: 'https://github.com/'+person.github_account.login, target: '_blank' }, img({ src: 'images/github.png' })),
            a({ href: 'https://github.com/'+person.github_account.login, target: '_blank' }, person.github_account.login)
          ),

          person.twitter_account && div({ 'class': 'profile-linked-account' },
            a({ href: 'https://twitter.com/'+person.twitter_account.login, target: '_blank' }, img({ src: 'images/twitter.png' })),
            a({ href: 'https://twitter.com/'+person.twitter_account.login, target: '_blank' }, person.twitter_account.login)
          ),

          person.facebook_account && div({ 'class': 'profile-linked-account' },
            a({ href: 'https://facebook.com/'+person.facebook_account.login, target: '_blank' }, img({ src: 'images/facebook.png' })),
            a({ href: 'https://facebook.com/'+person.facebook_account.login, target: '_blank' }, person.facebook_account.login)
          ),

          person.gittip_account && div({ 'class': 'profile-linked-account' },
            a({ href: 'https://gittip.com/'+person.gittip_account.login, target: '_blank' }, img({ src: 'images/gittip.png' })),
            a({ href: 'https://gittip.com/'+person.gittip_account.login, target: '_blank' }, person.gittip_account.login)
          )
        )
      );
    });
  });

  define('update_account', function(form_data) {

    // append bool for exclude_from_newsletter input, because javascript sucks
    var e = document.getElementById('exclude_from_newsletter');
    form_data.exclude_from_newsletter = !e.checked;

    clear_message();
    BountySource.update_account(form_data, function(response) {
      if (response.meta.success) {
        if (document.getElementById('account-incomplete-message')) render({ into: 'account-incomplete-message' }, '');
        render_message(success_message('Account updated!'));
      } else {
        render_message(error_message(response.data.error));
      }
    });
  });
};