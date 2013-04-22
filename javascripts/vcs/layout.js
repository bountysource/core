with (scope()) {

  define('default_layout', function(yield) {
    return div(
      div({ id: 'chatroom' }, iframe({ src: 'http://localhost:12345/' })),
      navbar,
      div({ 'class': 'container' }, yield)
    );
  });

  define('navbar', function() {
    return div({ 'class': 'navbar navbar-fixed-top' },
      div({ 'class': 'navbar-inner' },
        div({ 'class': 'container' },
          a({ 'class': "btn btn-navbar",  'data-toggle': 'collapse', 'data-target': '.nav-collapse' },
            span({ 'class': 'icon-bar'}),
            span({ 'class': 'icon-bar'}),
            span({ 'class': 'icon-bar'})
          ),

          a({ 'class': 'brand', href: '#' }, strong('Bountysource')),

          div({ 'class': 'nav-collapse collapse' },
            form({ 'class': 'navbar-search' },
              div({ 'class': 'icon-search' }),
              input({ type: 'text', 'class': 'search-query', placeholder: 'Issue URL, Project, Language, etc.' })
            ),

            ul({ 'class': 'nav pull-right' },
              //li({ 'class': 'active' }, a({ href: '#' }, 'Home')),
              li(a({ href: '#' }, 'About')),
              li(a({ href: '#' }, 'Explore')),
              li(a({ href: '#' }, 'Blog')),
              li({ id: 'chatroom-nav', 'class': 'dropdown dropup' }, a({ href: show_chatroom, 'class': 'dropdown-toggle' }, 'Chatroom ', b({ 'class': "caret" }))),

              account_dropdown
            )
          )
        )
      )
    );
  });

  define('show_chatroom', function() {
    $('body').toggleClass('chatroom');
    $('#chatroom-nav').toggleClass('active');
  });

  define('account_dropdown', function() {
    return li({ 'class': 'dropdown' },
      get('user_info') ? [
        a({ href: '#account', 'class': 'dropdown-toggle', 'data-toggle': 'dropdown' }, get('user_info').display_name, b({ 'class': "caret" })),
        ul({ 'class': 'dropdown-menu' },
          li(a({ href: '#' }, 'Balance: $25.00')),
          li({ 'class': 'divider' }),
          li(a({ href: '#fundraisers' }, 'Fundraisers')),
          li(a({ href: '#solutions' }, 'Bounties')),
          li(a({ href: '#account' }, 'Settings')),
          li(a({ href: '#' }, 'Logout'))
        )
      ] : [
        a({ href: '#account', 'class': 'dropdown-toggle', 'data-toggle': 'dropdown' }, b({ 'class': 'icon-user' }), ' Sign In ', b({ 'class': "caret" })),
        ul({ 'class': 'dropdown-menu' },
          li({ style: 'padding-left: 10px' }, 'Using:'),
          li(a({ href: '#fundraisers' }, img({ src: 'images/favicon-github.png' }), ' GitHub')),
          li(a({ href: '#solutions' }, img({ src: 'images/favicon-facebook.png' }), ' Facebook')),
          li(a({ href: '#account' }, img({ src: 'images/favicon-twitter.png' }), ' Twitter')),
          li(a({ href: '#signin/email' }, img({ src: 'images/favicon-email.png' }), ' Email Address'))
        )
      ]
    );
  });

  define('breadcrumbs', function() {
    var crumbs = [];
    for (var i=0; i < arguments.length; i++) {
      var crumb = [arguments[i]];
      if (i < arguments.length - 1) crumb.push(span({ 'class': 'divider' }, '»'));
      crumbs.push(li(crumb));
    }
    return ul({ 'class': 'breadcrumb' }, crumbs);
  });

}