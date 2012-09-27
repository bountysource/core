with (scope('Login', 'App')) {
  define('required', function() {
    if (Storage.get('access_token')) return true;
    Storage.set('_redirect_to_after_login', get_route());
    set_route('#login');
    return false;
  });

  route('#login', function() {
    if (Storage.get('access_token')) {
      set_route('#');
      return;
    }
    
    render(
      breadcrumbs('Account', 'Login'),
      
      div({ style: 'width: 415px; height: 320px; background: #eee; border: 1px solid #ccc; float: left; margin-right: 20px; padding: 20px' },
        h2({ style: 'text-transform: uppercase; color: #5e5f5f; font-size: 21px; text-align: center; font-weight: normal; margin-bottom: 10px' }, 'Have a GitHub Account?'),
        div({ style: 'width: 200px; margin: 0 auto' },
          img({ src: 'images/github.png' }),
          br(),
          Github.link_requiring_auth({ href: (Storage.get('_redirect_to_after_login') || '#'), 'class': 'green' }, 'Login with GitHub')
        )
      ),
      
      div({ style: 'width: 415px; height: 320px; background: #eee; border: 1px solid #ccc; float: left; padding: 20px' },
        h2({ style: 'text-transform: uppercase; color: #5e5f5f; font-size: 21px; text-align: center; font-weight: normal; margin-bottom: 10px' }, 'Have a BountySource Account?'),
        form({ action: login, style: 'width: 200px; margin: 40px auto 0' }, 
          
          div({ style: 'color: #999' }, "EMAIL:"),
          div({ style: 'margin-bottom: 15px' }, text({ style: 'width: 180px; border: 1px solid #ccc; font-size: 18px; line-height: 18px; padding: 0 10px; height: 40px', name: 'email', placeholder: 'john.doe@gmail.com' })),

          div({ style: 'color: #999' }, "PASSWORD:"),
          div({ style: 'margin-bottom: 15px' }, password({ style: 'width: 180px; border: 1px solid #ccc; font-size: 18px; line-height: 18px; padding: 0 10px; height: 40px', name: 'password', placeholder: 'abc123'})),
          div({ style: 'margin-top: 39px' }, submit({ 'class': 'green' }, 'Login'))
        )
      ),
      
      div({ style: 'clear: both' })
    );
  });

  define('login', function(form_data) {
    BountySource.login(form_data.email, form_data.password, function(response) {
      if (response.meta.success) {
        Storage.set('access_token', response.data.access_token);
        set_route(Storage.remove('_redirect_to_after_login') || '#', { reload_page: true });
      } else {
        alert('Login and password combination was not found.');
      }
    });
  });
}