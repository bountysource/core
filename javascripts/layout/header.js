with (scope('Header','App')) {
  // update social buttons after loading the page
  // after_filter(reload_social_buttons);


  define('create', function() {
     return header(
       section(
         a({ 'class': 'bountysource-logo', href: '#' },
           img({
             // style: 'margin-left: 20px; vertical-align: middle;',
             src: 'images/logo-beta.png'
           })
         ),

         global_search,

         logged_in() && ul({ id: 'user-action-items' },
           li(NotificationFeed.create),
           li(UserNav.create),
           div({ style: 'clear: both;' })
         ),

         !logged_in() && div({ id: 'signin-buttons' },
           span('Sign In with:'),

           ul(
             li(a({ href: Github.auth_url() },   img({ src: 'images/github.png' }))),
             li(a({ href: Facebook.auth_url() }, img({ src: 'images/facebook.png' }))),
             li(a({ href: Twitter.auth_url() },  img({ src: 'images/twitter.png' }))),
             li(a({ href: '#signin/email' },     img({ src: 'images/facebook.png' })))
           )
         ),

         div({ style: 'clear: both;' })
       ),

       div({ id: 'forkme' },
         a({ href: "https://github.com/bountysource/frontend", target: '_blank' },
           img({ src: "images/forkme.png", alt: "Fork me on GitHub"})
         )
       )
     );
  });

  define('reload_social_buttons', function() {
    render({ target: 'global-social-buttons' },
      ul(
        li({ style: 'padding-top: 3px;' }, Twitter.follow_button),
        // li({ style: 'height: 20px;' }, Facebook.follow_button),
        li({ style: 'padding-top: 3px;' }, Twitter.share_button),

        li({ style: 'padding-top: 3px;' }, GooglePlus.like_button),

        // li({ style: 'width: 100px;' }, Facebook.like_button({ 'data-layout': 'button_count', 'data-name': 'name', style: 'z-index: 3;' })),

        li({ id: 'fb-like-button' }, Facebook.create_share_button({
          name:         'BountySource',
          caption:      '',
          description:  '',
          link:         window.location.href,
          // picture:      'images/bountysource-icon.png'
        }))
      )
    );
    Twitter.process_elements();
    GooglePlus.process_elements();
    Facebook.process_elements();
  });

  // update the FB like button in place with new meta data
  define('update_facebook_like_button', function(new_attributes) {
    return console.log('TODO fix this');

    new_attributes = new_attributes || {};
    render({ target: 'fb-like-button' }, Facebook.create_share_button(new_attributes));
  });
}