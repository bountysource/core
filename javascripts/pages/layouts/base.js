with (scope()) {

  layout('default', function() {
    console.log("CALLING DEFAULT LAYOUT, OMG");

    return div(
      chatroom,
      navbar,
      div({ 'class': 'container' }, arguments)
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
              chatroom_dropup,
              account_dropdown
            )
          )
        )
      )
    );
  });

  define('account_dropdown', function() {
    return li({ 'class': 'dropdown' },
      a({ href: '#signin', 'class': 'dropdown-toggle', 'data-toggle': 'dropdown' }, get('person') ? get('person').display_name : 'Sign In', b({ 'class': "caret" })),

      ul({ 'class': 'dropdown-menu' },
        get('person') ? [
          li(a({ href: '#' }, 'Balance: ', get('person').account_balance)),
          li({ 'class': 'divider' }),
          li(a({ href: '#fundraisers' }, 'Fundraisers')),
          li(a({ href: '#solutions' }, 'Bounties')),
          li(a({ href: '#account' }, 'Settings')),
          li(a({ href: '#' }, 'Logout'))
        ] : [
          li({ style: 'padding-left: 10px' }, 'Using:'),
          li(a({ href: Person.github_auth_url() }, img({ src: 'images/favicon-github.png' }), ' GitHub')),
          li(a({ href: Person.facebook_auth_url() }, img({ src: 'images/favicon-facebook.png' }), ' Facebook')),
          li(a({ href: Person.twitter_auth_url() }, img({ src: 'images/favicon-twitter.png' }), ' Twitter')),
          li(a({ href: '#signin/email' }, img({ src: 'images/favicon-email.png' }), ' Email Address'))
        ]
      )
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