with (scope('Header','App')) {
  // reload the signin buttons on every page load, so that they have the correct redirect URl
  with (scope('App')) { after_filter(function() { !logged_in() && reload_signin_buttons() }) }

  define('create', function() {
    Header.global_social_buttons = div({ id: 'global-social-buttons' });
    Header.global_search_input = input({ name: 'query', placeholder: 'Enter Issue URL...', required: true });
    Header.global_search = form({ id: 'global-search', action: Search.search_from_homepage }, Header.global_search_input);

    if (!logged_in()) {
      Header.signin_buttons = div({ id: 'signin-buttons' });
    }

    var header_element = header(
      section(
        a({ 'class': 'bountysource-logo', href: '#' },
          img({ src: 'images/logo.png' }),
          Header.global_social_buttons
        ),

        Header.global_search,

        div({ style: 'float: right; margin-top: 15px;' },
          // logged in? show the user nav dropdown
          logged_in() && [

            // TODO: Enable notifications feed when it is populated with more data
            // span({ style: 'margin-right: 10px;'}, NotificationFeed.create),

            UserNav.create
          ],

          // not logged in? show the signin buttons!
          !logged_in() && Header.signin_buttons
        )
      ),

      div({ id: 'forkme' },
        a({ href: "https://github.com/bountysource/frontend", target: '_blank' },
          img({ src: "images/forkme.png", alt: "Fork me on GitHub"})
        )
      )
    );

    reload_social_buttons();

    return header_element;
  });

  define('reload_social_buttons', function() {
    render({ into: Header.global_social_buttons },
      ul(
        li(Twitter.follow_button({
          'data-count':             'none',
          'data-show-screen-name':  false
        })),

        li(GooglePlus.like_button({
          'data-annotation': 'none'
        })),

        li(Facebook.like_button({
          'data-href': 'https://www.bountysource.com'
        }))
      )
    );

    Twitter.process_elements();
    GooglePlus.process_elements();
    Facebook.process_elements();
  });

  define('reload_signin_buttons', function() {
    render({ into: Header.signin_buttons },
      span('Sign In with:'),
      ul(
        li(a({ href: Github.auth_url() },   img({ src: 'images/github.png' }))),
        li(a({ href: Facebook.auth_url() }, img({ src: 'images/facebook.png' }))),

        // li(a({ href: Twitter.auth_url() },  img({ src: 'images/twitter.png' }))),

        li(a({ href: '#signin/email' },     img({ src: 'images/email.png' })))
      )
    );
  });
}