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
      
      div({ style: 'width: 400px; background: #eee; border: 1px solid #ccc; float: left; margin-right: 20px; padding: 20px' },
        h2('Have a GitHub Account?'),
        div({ style: 'width: 200px; margin: 0 auto' },
          img({ src: 'images/github.png' }),
          br(),
          Github.link_requiring_auth({ href: (Storage.get('_redirect_to_after_login') || '#'), 'class': 'green' }, 'Login with GitHub')
        )
      ),
      
      div({ style: 'width: 400px; background: #eee; border: 1px solid #ccc; float: left; padding: 20px' },
        h2('Have a BountySource password?'),
        form({ action: login }, 
          text({ name: 'email', placeholder: 'john.doe@gmail.com' }),
          br(),
          password({ name: 'password', placeholder: 'abc123'}),
          br(),
          div({ style: 'width: 200px; margin: 0 auto' }, submit({ 'class': 'green' }, 'Login'))
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