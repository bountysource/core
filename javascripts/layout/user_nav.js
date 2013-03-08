with (scope('UserNav', 'App')) {
  define('create', function() {
    UserNav._wrapper = div({ id: 'user-nav' });
    UserNav.reload();
    return UserNav._wrapper;
  });

  define('reload', function() {
    UserNav._wrapper.removeEventListener('mouseover', user_nav_flyout_mouseover);
    UserNav._wrapper.removeEventListener('mouseout',  user_nav_flyout_mouseout);

    render({ into: UserNav._wrapper }, div({ style: "padding: 10px;" }, img({ src: 'images/spinner.gif' })));

    BountySource.get_cached_user_info(function(user) {
      var show_pennies = user.account.balance && user.account.balance.toString().split('.').length > 1;

      render({ into: UserNav._wrapper },
        div({ id: 'btn' },
          a({ href: user.frontend_path },
            img({ src: user.image_url }),
            span(user.display_name),

            (user.account.balance > 0) && span('(' + money(user.account.balance, show_pennies) + ')')
          )
        ),

        div({ id: 'user-nav-flyout-wrapper' },
          ul(
            li(a({ href: '#account/create_fundraiser' }, 'Create Fundraiser')),
            li(a({ href: '#account/fundraisers' },       'Fundraisers')),
            li(a({ href: '#contributions' },             'Contributions')),
            li(a({ href: '#solutions' },                 'Solutions')),
            li(a({ href: '#account' },                   'Account')),
            li(a({ href: BountySource.logout },          'Logout'))
          )
        )
      );

      UserNav._wrapper.addEventListener('mouseover', user_nav_flyout_mouseover);
      UserNav._wrapper.addEventListener('mouseout',  user_nav_flyout_mouseout);
    });
  });

  // User nav flyout events
  define('user_nav_flyout_mouseover', function() {
    add_class(this, 'active');

    if (this.usernav_timeout) {
      clearTimeout(this.usernav_timeout);
      delete this.usernav_timeout;
    }
  });

  define('user_nav_flyout_mouseout', function(e) {
    var user_nav = this;
    if (this.usernav_timeout) clearTimeout(this.usernav_timeout);
    this.usernav_timeout = setTimeout(function() {
      remove_class(user_nav, 'active');
    }, 250);
  });
}