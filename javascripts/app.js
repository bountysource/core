with (scope('App')) {
  define('default_layout', function(yield) {
    return section({ id: 'wrapper' },
      header(
        h1(a({ href: '#' }, 'BountySource'))
      ),
      section({ id: 'content' },
        yield
      ),
      footer(
        ul(
          li(a({ href: '#about' }, 'About')),
          li(a({ href: '#about' }, 'Contact Us')),
          li(a({ href: '#about' }, 'Blog'))
        )
      )
    );
  });

  route('#', function() {
    render(
      h2('Developers'),
      ul(
        li(Github.auth_button),
        li(a({ href: '#bounties' }, 'Find Bounties'))
      ),
      h2('Patrons'),
      ul(
        li(
          "Search: ",
          search()
        )
      )
    );
  });

  // End point for Github login.
  route ('#login/:access_token', function(access_token) {
    Storage.set('access_token',access_token);
    set_route('#');
  });

  route('#about', function() {
    render(
      h2('About'),
      p('this is awesome!')
    );
  });

}