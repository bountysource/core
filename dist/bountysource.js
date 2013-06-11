with (scope()) {
  initializer(function() {
    // NOTE: this is read before Storage.namespace is set, so it won't get prefixed
    //var environment = (navigator.userAgent == 'Selenium') ? 'test' : (Storage.get('environment') || 'prod');
    var environment = Storage.get('environment') || 'prod';

    switch (environment) {
      case 'dev':
        Storage.namespace = 'dev';
        Bountysource.api_host = 'http://api.bountysource.dev/';
        break;
      case 'qa':
        Storage.namespace = 'qa';
        Bountysource.api_host = 'https://api-qa.bountysource.com/';
        break;
      case 'test':
        Storage.namespace = 'test';
        Bountysource.api_host = 'http://test.example/';
        break;
      case 'prod':
        Storage.namespace = 'prod';
        Bountysource.api_host = 'https://api.bountysource.com/';
        break;
    }
  });

  define('set_environment', function(env) {
    Storage.namespace = null;
    Storage.set('environment', env);
    document.location.reload();
  });

  after_filter('add_dev_mode_bar', function() {
    if (!document.getElementById('dev-bar')) {
      document.body.appendChild(
        div({ id: 'dev-bar', style: "position: fixed; bottom: 0; right: 0; background: white; color: black; padding: 5px; z-index: 200; box-shadow: 0 0 5px rgba(0,0,0,0.5)" },
          (Bountysource.api_host == 'http://test.example/' ? [b('test'), ' | '] : []),
          (Bountysource.api_host == 'http://api.bountysource.dev/' ? b('dev') : a({ href: curry(set_environment, 'dev') }, 'dev')),
          ' | ',
          (Bountysource.api_host == 'https://api-qa.bountysource.com/' ? b('qa') : a({ href: curry(set_environment, 'qa') }, 'qa')),
          ' | ',
          (Bountysource.api_host == 'https://api.bountysource.com/' ? b('prod') : a({ href: curry(set_environment, 'prod') }, 'prod'))
        )
      );
    }
  });
}
;with (scope('Bountysource')) {

  define('api_path', 'https://api.bountysource.com/');

  define('attribute', function() {
    console.log("ATTRIBUTE: ", arguments);
  });
};with (scope('Fundraiser', 'Bountysource')) {

  attribute('title', 'description');

  define('find', function(id) {
    JSONP.get({ url: api_path + 'fundraisers/'+id, callback: function(response) {
      console.log(response);
    }});
  });

}
//new Fundraiser({
//  title: "One Thousand and One Nights",
//  author: "Scheherazade"
//});
;;with (scope('Person', 'Bountysource')) {

  define('find', function(id) {
    JSONP.get({ url: url+'/'+id, callback: function(response) {
      console.log(response);
    }});
  });

  define('github_auth_url', function(options) {
    options = options || {};
    return Bountysource.api_host+'auth/github?scope='+(options.scope||'') +
      '&access_token='+(get('person') ? get('person').access_token : '') +
      '&redirect_url='+encode_html(window.location.href); // make sure the redirect url is the last param?
  });

  define('facebook_auth_url', function(options) {
    options = options || {};
    return Bountysource.api_host+'auth/facebook?scope='+(options.scope||'email') +
      '&access_token='+(get('person') ? get('person').access_token : '') +
      '&redirect_url='+encode_html(window.location.href); // make sure the redirect url is the last param?
  });

  define('twitter_auth_url', function(options) {
    options = options || {};
    return Bountysource.api_host+'auth/twitter?scope='+(options.scope||'') +
      '&access_token='+(get('person') ? get('person').access_token : '') +
      '&redirect_url='+encode_html(window.location.href); // make sure the redirect url is the last param?
  });

};;;with (scope()) {

  route('#fundraisers/:fundraiser_id', function(fundraiser_id) {
    var fundraiser = Fundraiser.find(fundraiser_id);

    render(
      ul({ 'class': 'breadcrumb' },
        li(a({ href: "#" }, 'Home'), span({ 'class': 'divider' }, '»')),
        li(a({ href: "#" }, 'Fundraisers'), span({ 'class': 'divider' }, '»')),
        li(a({ href: "#" }, fundraiser.title))
      ),

      div({ 'class': 'row-fluid issue-show' },
        div({ 'class': 'span9' },
          div({ 'class': "well", style: 'color: #333' },
            h3(fundraiser.title),
            p(fundraiser.description)
          ),

          ul({ 'class': 'nav nav-tabs' },
            li({ 'class': 'active' }, a({ href: '#' }, 'Details')),
            li(a({ href: '#' }, 'Updates (10)')),
            li(a({ href: '#' }, 'Comments (35)'))
          )

        ),
        div({ 'class': 'span3' },
          div({ 'class': "alert alert-success", style: 'color: #333' },
            h3('Backers ($0)'),
            p('lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, ')
          )
        )

      )
    );
  });

};with (scope()) {

  route('#', function() {
    render(
      div({ 'class': "alert alert-success text-center", style: 'color: #333' },
        h2("The funding platform for open-source software."),
        p({ 'class': 'lead' }, "Use bounties and fundraisers to improve the open-source projects you love!"),
        p(a({ href: '#about', 'class': 'btn btn-success' }, 'Learn how it works'))
      ),

      div({ 'class': 'row-fluid homepage' },
        div({ 'class': 'span3' },
          div({ 'class': "well card", style: 'color: #333' },
            div({ 'class': 'image' }, img({ src: 'https://c10078377.ssl.cf2.rackcdn.com/38d0de99945b4ed4b7cf1a3b5ab40625.png' })),
            div({ 'class': 'content' },
              h2('Farwest'),
              p('by lhoguin'),
              p('Farwest allows front-end developers to write Erlang-powered applications without having to write any Erlang code.'),
              p('$125 pledged'),
              p('88days left')
            )
          ),
          div({ 'class': "alert alert-info", style: 'color: #333' },
            a({ href: '#issues/123'}, 'Some issue ($50000)'),br(),
            a({ href: '#trackers/123'}, 'Some tracker ($50000)'),br(),
            a({ href: '#fundraisers/123'}, 'Some fundraiser ($50000)')
          ),
          p("lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, non volutpat nisi blandit et. Sed eu aliquam lorem. Ut a orci ante, at varius elit. Pellentesque et lorem a quam volutpat tristique. In semper ultricies mauris, a gravida lacus egestas a. Suspendisse posuere egestas quam iaculis ullamcorper. Vestibulum eget molestie metus.")
        ),

        div({ 'class': 'span3' },
          div({ 'class': "well card", style: 'color: #333' },
            div({ 'class': 'image' }, img({ src: 'https://c10078377.ssl.cf2.rackcdn.com/651178082af3e23f5fe09b216253c938.png' })),
            div({ 'class': 'content' },
              h2('Kivy on Raspberry Pi'),
              p('by lhoguin'),
              p('Farwest allows front-end developers to write Erlang-powered applications without having to write any Erlang code.'),
              p('$125 pledged'),
              p('88days left')
            )
          ),
          p("lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, non volutpat nisi blandit et. Sed eu aliquam lorem. Ut a orci ante, at varius elit. Pellentesque et lorem a quam volutpat tristique. In semper ultricies mauris, a gravida lacus egestas a. Suspendisse posuere egestas quam iaculis ullamcorper. Vestibulum eget molestie metus."),
          p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, non volutpat nisi blandit et. Sed eu aliquam lorem. Ut a orci ante, at varius elit. Pellentesque et lorem a quam volutpat tristique. In semper ultricies mauris, a gravida lacus egestas a. Suspendisse posuere egestas quam iaculis ullamcorper. Vestibulum eget molestie metus.")
        ),

        div({ 'class': 'span3' },
          div({ 'class': "well card", style: 'color: #333' },
            div({ 'class': 'image' }, img({ src: 'https://c10078377.ssl.cf2.rackcdn.com/1f3b49934d2f6557fc93c77e24ac2e20.png' })),
            div({ 'class': 'content' },
              h2('Farwest'),
              p('by lhoguin'),
              p('Farwest allows front-end developers to write Erlang-powered applications without having to write any Erlang code.'),
              p('$125 pledged'),
              p('88days left')
            )
          ),
          p("lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, non volutpat nisi blandit et. Sed eu aliquam lorem. Ut a orci ante, at varius elit. Pellentesque et lorem a quam volutpat tristique. In semper ultricies mauris, a gravida lacus egestas a. Suspendisse posuere egestas quam iaculis ullamcorper. Vestibulum eget molestie metus."),
          p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, non volutpat nisi blandit et. Sed eu aliquam lorem. Ut a orci ante, at varius elit. Pellentesque et lorem a quam volutpat tristique. In semper ultricies mauris, a gravida lacus egestas a. Suspendisse posuere egestas quam iaculis ullamcorper. Vestibulum eget molestie metus.")
        ),

        div({ 'class': 'span3' },
          div({ 'class': "well card", style: 'color: #333' },
            div({ 'class': 'image' }, img({ src: 'https://c10078377.ssl.cf2.rackcdn.com/ce1194dd6eb19069cf034f962810a94a.png' })),
            div({ 'class': 'content' },
              h2('Farwest'),
              p('by lhoguin'),
              p('Farwest allows front-end developers to write Erlang-powered applications without having to write any Erlang code.'),
              p('$125 pledged'),
              p('88days left')
            )
          ),
          p("lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, non volutpat nisi blandit et. Sed eu aliquam lorem. Ut a orci ante, at varius elit. Pellentesque et lorem a quam volutpat tristique. In semper ultricies mauris, a gravida lacus egestas a. Suspendisse posuere egestas quam iaculis ullamcorper. Vestibulum eget molestie metus."),
          p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, non volutpat nisi blandit et. Sed eu aliquam lorem. Ut a orci ante, at varius elit. Pellentesque et lorem a quam volutpat tristique. In semper ultricies mauris, a gravida lacus egestas a. Suspendisse posuere egestas quam iaculis ullamcorper. Vestibulum eget molestie metus.")
        )
      )
    );
  });

};with (scope()) {

  define('issue', {
    title: 'Split pane feature'
  });

  route('#issues/:issue_id', function(issue_id) {
    //TODO: var issue_id = params.issue_id;

    render(
      ul({ 'class': 'breadcrumb' },
        li(a({ href: "#" }, 'Home'), span({ 'class': 'divider' }, '»')),
        li(a({ href: "#" }, 'Trac'), span({ 'class': 'divider' }, '»')),
        li(a({ href: "#" }, '#4553: Stuff here'))
      ),

      div({ 'class': 'row-fluid issue-show' },
        div({ 'class': 'span9' },
          div({ 'class': "well", style: 'color: #333' },
            h3(issue.title),
            p('lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, ')
          ),

          ul({ 'class': 'nav nav-tabs' },
            li({ 'class': 'active' }, a({ href: '#' }, 'Comments (10)')),
            li(a({ href: '#' }, 'Bounties')),
            li(a({ href: '#' }, 'History'))
          ),

          [1,1,1,1,1,1,1,1,1,1].map(function() {
            return div({ 'class': "well", style: 'color: #333' },
              h5('John said fdsafds'),
              p('stuff here')
            );
          })
        ),
        div({ 'class': 'span3' },
          div({ 'class': "alert alert-success", style: 'color: #333' },
            h3('Bounties ($0)'),
            p('lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, ')
          ),

          div({ 'class': "alert alert-info", style: 'color: #333' },
            h3('Developers'),
            p('lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, ')
          ),

          div({ 'class': "alert alert-warning", style: 'color: #333' },
            h3('Developers'),
            p('lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, ')
          ),

          div({ 'class': "alert alert-error", style: 'color: #333' },
            h3('Developers'),
            p('lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, ')
          )
        )
      )
    );
  });

};with (scope()) {

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

};with (scope()) {

  define('chatroom', function() {
    var chatroom_div = div({ id: 'chatroom' });

    var default_nick = function() {
      return get('person') ? get('person').display_name : ('Guest' + Math.floor(Math.random()*99999));
    };

    var chatroom_connect = function(form_data) {
      render({ into: chatroom_div }, iframe({
        src: 'http://localhost:12345/?nick=' + (form_data.nick || default_nick()),
        style: 'display: none',
        onLoad: function() { console.log(this); show(this); }
      }));
    };

    render({ into: chatroom_div },
      div({ 'class': 'connect' },
        p({ style: 'text-align: center; padding-top: 10px' }, "The #Bountysource IRC Chatroom is a place to communicate with other Bountysource users."),

        form({ style: 'text-align: center; padding-top: 10px', action: chatroom_connect },
          span("Nickname:"),
          text({ 'class': 'input-text input-medium', name: 'nick', style: 'margin: 0 10px', placeholder: default_nick }),
          submit({ 'class': 'btn btn-success' }, "Connect")
        )
      )
    );

    return chatroom_div;
  });

  define('chatroom_dropup', function() {
    var chatroom_li = li({ 'class': 'dropdown dropup' });

    var chatroom_toggle = function() {
      toggle_class(document.body, 'chatroom');
      toggle_class(chatroom_li, 'active');
    };

    render({ into: chatroom_li }, a({ href: chatroom_toggle, 'class': 'dropdown-toggle' }, 'Chatroom ', b({ 'class': "caret" })));

    return chatroom_li;
  });

};with (scope('People')) {

  route('#signin', function() {
    render(
      h1("Please sign in to continue.")
    );
  });

  route('#signin/email', function() {
    //if (logged_in()) return set_route('#');

    render(
      breadcrumbs(a({ href: '#' }, 'Home'), a({ href: '#signin' }, 'Sign In'), 'Email Address'),

      h1("Sign In with your Email Address"),
      p("Please enter your email address and a password. If you don't have a Bountysource account yet, we'll create one for you."),

      //super_signin_form(get_params())

      form({ 'class': 'form-horizontal' },
        div({ 'class': 'control-group success' },
          label({ 'class': 'control-label', 'for': 'inputEmail' }, 'Email:'),
          div({ 'class': 'controls' },
            //, onChange: curry(process_email_address_changed, refs)
            text({ name: 'email', placeholder: 'john.doe@gmail.com', value: params.email }),
            span({ 'class': 'help-inline'
            }, 'Email available!')
          )
        ),

        div({ 'class': 'control-group error' },
          label({ 'class': 'control-label', 'for': 'inputEmail' }, 'Password:'),
          div({ 'class': 'controls' },
            password({ placeholder: 'abc123' }),
            span({ 'class': 'help-inline' }, 'Password wrong!')
          )
        ),

        div({ 'class': 'control-group error' },
          label({ 'class': 'control-label', 'for': 'inputEmail' }, 'First and Last Name:'),
          div({ 'class': 'controls' },
            text({ 'class': 'input-small input-right-margin', placeholder: 'John' }),
            text({ 'class': 'input-small', placeholder: 'Doe' }),
            span({ 'class': 'help-inline' }, 'Required')
          )
        ),

        div({ 'class': 'control-group' },
          label({ 'class': 'control-label', 'for': 'inputEmail' }, 'Display Name:'),
          div({ 'class': 'controls' },
            text({ name: 'email', placeholder: 'John Doe' })
          )
        ),

        div({ 'class': 'control-group' },
          div({ 'class': 'controls' },
            submit({ 'class': 'btn btn-primary' }, 'Sign in')
          )
        )
      )
    );
  });

  route('#auth/:provider', function(provider) {
    alert('oh hai');
//    if (params.status == 'linked') {
//      // now they're logged in with this github account
//      save_user_data_and_redirect({ data: params.access_token });
//    } else if (params.status == 'error_needs_account') {
//      render(
//        breadcrumbs(a({ href: '#' }, 'Home'), 'Sign In'),
//        h1("Last step to Sign In"),
//        super_signin_form(params)
//      );
//    } else if (params.status == 'error_already_linked') {
//      render('ERROR: Account already linked.');
//    } else {
//      render('ERROR: Unknown status.');
//    }
  });

//  define('super_signin_form', function(params) {
//    var refs = {};
//
//    refs.email_is_registered = null;
//    if (params.email) {
//      if (typeof(params.email_is_registered) == 'boolean') {
//        refs.email_is_registered = params.email_is_registered;
//      } else {
//        setTimeout(curry(process_email_address_changed,refs), 0);
//      }
//    }
//
//    refs.error_div = div();
//
//    refs.email_status_div = div({ style: 'margin-left: 175px; font-size: 11px; font-style:italic' });
//
//    refs.sign_in_up_button = submit({ 'class': 'button green no-hover' }, 'Continue');
//
//    refs.account_link_id = params.account_link_id;
//
//    refs.password_fieldset = fieldset(
//      refs.password_label,
//
//    );
//
//    refs.first_and_last_name_fieldset = fieldset(
//      label('First and Last Name:'),
//      text({ name: 'first_name', 'class': 'shortish', placeholder: 'John', value: params.first_name||'' }),
//      text({ name: 'last_name', 'class': 'shortish', placeholder: 'Doe', value: params.last_name||'' })
//    );
//
//    refs.display_name_fieldset = fieldset(
//      label('Display Name:'),
//      text({ name: 'display_name', placeholder: 'john.doe', value: params.display_name||(params.email && params.email.split('@')[0])||'' }),
//      params.avatar_url && img({ src: params.avatar_url, style: "vertical-align: middle; width: 42px; height: 42px" })
//    );
//
//    refs.signup_fields = div(
//      refs.first_and_last_name_fieldset,
//      refs.display_name_fieldset
//    );
//
//    refs.button_fieldset = fieldset({ 'class': 'no-label '},
//      refs.sign_in_up_button
//    );
//
//    auto_adjust_super_form_fields(refs);
//
//    return form({ 'class': 'form-horizontal', action: curry(process_signin_form, refs) },
//      refs.account_link_id && hidden({ name: 'account_link_id', value: refs.account_link_id }),
//
//      refs.error_div,
//      refs.account_link_hidden,
//      refs.email_fieldset,
//      refs.password_fieldset,
//      refs.signup_fields,
//      refs.button_fieldset
//    );
//  });

  define('auto_adjust_super_form_fields', function(refs) {
    // email help text
    if (refs.email_is_registered === null) render({ into: refs.email_status_div });
    else if (refs.email_is_registered === true) render({ into: refs.email_status_div }, "Email address found. Enter your password to Sign In.");
    else if (refs.email_is_registered === false) render({ into: refs.email_status_div }, "Email address not yet registered.");

    // password is visible unless sign up with linked account
    (refs.account_link_id && refs.account_link_id.match(/^(github|facebook|twitter):/) && !refs.email_is_registered ? hide : show)(refs.password_fieldset);
    render({ into: refs.password_label }, refs.email_is_registered === false ? 'Create Password:' : 'Password:');

    // signup fields visible only if email isn't registered
    (refs.email_is_registered === false ? show : hide)(refs.signup_fields);

    // text on the submit button
    if (refs.email_is_registered === null) refs.sign_in_up_button.value = 'Continue';
    else if (refs.email_is_registered === true) refs.sign_in_up_button.value = 'Sign In';
    else if (refs.email_is_registered === false) refs.sign_in_up_button.value = 'Sign Up';
  });

  define('process_email_address_changed', function(refs) {
    refs.sign_in_up_button.disabled = true;
    BountySource.login({ email: refs.email.value }, function(response) {
      refs.sign_in_up_button.disabled = false;
      refs.email_is_registered = response.data.email_is_registered;
      auto_adjust_super_form_fields(refs);
    });
  });



  define('save_user_data_and_redirect', function(response) {
    var redirect_url = null;
    var params = get_params();

    if (Storage.get('_redirect_to_after_login')) {
      redirect_url = Storage.get('_redirect_to_after_login');
      Storage.clear('_redirect_to_after_login');
    } else if (response.data.redirect_url) {
      redirect_url = response.data.redirect_url;
      delete response.data.redirect_url;
    } else if (params.redirect_url) {
      redirect_url = params.redirect_url;
    } else {
      redirect_url = '#';
    }

    if (redirect_url == '#signin') redirect_url = '#';

    BountySource.set_access_token(response.data);
    set_route(redirect_url, { reload_page: true });
  });

  define('process_signin_form', function(refs, form_data) {
    render({ into: refs.error_div });

    BountySource.login(form_data, function(response) {
      if (response.meta.success) {
        save_user_data_and_redirect(response);
      } else if (!response.data.email_is_registered && is_visible(refs.signup_fields)) {
        // email isn't registered and the signup fields were visible when they clicked... try to create an account
        BountySource.create_account(form_data, function(response) {
          if (response.meta.success) {
            save_user_data_and_redirect(response);
          } else {
            render({ into: refs.error_div }, error_message(response.data.error));
          }
        });
      } else {
        // failed login?
        if (response.data.email_is_registered && is_visible(refs.password_fieldset)) {
          render({ into: refs.error_div },
            error_message(
              "The password you entered is incorrect.  If you don't know what it is, you can ",
              a({ style: 'text-decoration: underline', href: curry(send_password_reset_email, refs, form_data.email) }, "reset your password via email"), '.'
            )
          );
        }

        refs.email_is_registered = response.data.email_is_registered;
        auto_adjust_super_form_fields(refs);
      }
    });
  });

  define('send_password_reset_email', function(refs, email) {
    BountySource.request_password_reset({ email: email }, function(response) {
      if (response.meta.success) {
        render({ into: refs.error_div }, success_message('Password reset email has been sent.'));
      } else {
        render({ into: refs.error_div }, error_message(response.data.error));
      }
    });
  });


//
//  ///////////////////////////////////////////////////////////////////
//
//  route('#signin/reset', function() {
//    if (logged_in()) return set_route('#');
//
//    var error_div = div();
//    var params = get_params();
//    render(
//      breadcrumbs(a({ href: '#' }, 'Home'), a({ href: '#signin' }, 'Sign In'), 'Reset Password'),
//      h1("Enter a new password for your account"),
//
//      error_div,
//
//      form({ 'class': 'fancy', action: curry(reset_password, error_div) },
//        fieldset(
//          label('Email:'),
//          span({ 'class': 'big_text' }, params.email),
//          hidden({ name: 'email', value: params.email })
//        ),
//
//        fieldset(
//          label('Reset Code:'),
//          span({ 'class': 'big_text' }, params.code),
//          hidden({ name: 'code', value: params.code })
//        ),
//
//        fieldset(
//          label('New Password:'),
//          password({ name: 'new_password', 'class': 'shortish', placeholder: 'abc123' })
//        ),
//
//        fieldset({ 'class': 'no-label '},
//          submit({ 'class': 'green no-hover' }, 'Reset Password')
//        )
//      )
//    );
//  });
//
//  define('reset_password', function(error_div, form_data) {
//    render({ into: error_div });
//
//    BountySource.reset_password(form_data, function(response) {
//      if (response.meta.success) {
//        process_signin_form(error_div, { email: form_data.email, password: form_data.new_password });
//      } else {
//        render({ into: error_div }, error_message(response.data.error));
//      }
//    })
//  });
//

};with (scope()) {

  define('tracker', {
    name: 'JSHint',
    issues: [
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 },
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 },
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 },
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 },
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 },
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 },
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 },
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 },
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 },
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 },
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 },
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 }
    ]
  });

  route('#trackers/:issue_id', function(issue_id) {
    //TODO: var issue_id = params.issue_id;

    render(
      ul({ 'class': 'breadcrumb' },
        li(a({ href: "#" }, 'Home'), span({ 'class': 'divider' }, '»')),
        li(a({ href: "#" }, 'JSHint'))
      ),

      div({ 'class': 'row-fluid issue-show' },
        div({ 'class': 'span9' },
          div({ 'class': "well", style: 'color: #333' },
            h3(tracker.name),
            p('lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, ')
          ),

          ul({ 'class': 'nav nav-tabs' },
            li({ 'class': 'active' }, a({ href: '#' }, 'Popular Issues')),
            li(a({ href: '#' }, 'Recent Issues')),
            li(a({ href: '#' }, 'Past Issues'))
          ),

          table({ 'class': 'table table-hover table-bordered table-condensed' },
            tbody(
              tr(
                th('Number'),
                th('Title'),
                th('Comments'),
                th('Bounties')
              ),

              tracker.issues.map(function(issue) {
                return tr({ style: 'cursor: pointer' },
                  td(issue.number),
                  td(issue.title),
                  td(issue.comment_count),
                  td(issue.total_bounties)
                );
              })
            )
          )
        ),
        div({ 'class': 'span3' },
          div({ 'class': "alert alert-success", style: 'color: #333' },
            h3('Overview'),
            p('lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, ')
          )
        )
      )
    );
  });

}