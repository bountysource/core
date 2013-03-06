with (scope('App')) {
  // User nav flyout
  define('user_nav_flyout_mouseout', function() {
    if (this.usernav_timeout) clearTimeout(this.usernav_timeout);
    this.usernav_timeout = setTimeout(function() {
      document.getElementById('user-nav').className = '';
    }, 500);
  });

  define('user_nav_flyout_mouseover', function() {
    document.getElementById('user-nav').className = 'flyout';
    if (this.usernav_timeout) {
      clearTimeout(this.usernav_timeout);
      delete this.usernav_timeout;
    }
  });

  define('user_nav', function() {
    var user_nav = div({ id: 'user-nav',
        onMouseOver: user_nav_flyout_mouseover,
        onMouseOut:  user_nav_flyout_mouseout },
      a({ href: function() {} }, 'Loading...')
    );

    BountySource.get_cached_user_info(function(user) {
      var show_pennies = user.account.balance && user.account.balance.toString().split('.').length > 1;

      render({ into: user_nav },
        a({ href: '#account', id: 'user_nav_a' },
          img({ id: 'user_nav_avatar', src: user.image_url }),
          span({ id: 'user_nav_name' },
            user.display_name,
            (user.account.balance > 0) && span({ style: 'margin-left: 5px;' }, ' (' + money(user.account.balance, show_pennies) + ')')
          )
        ),
        div({ id: 'user_nav_flyout' },
          a({ href: '#account/create_fundraiser' }, 'Create Fundraiser'),
          a({ href: '#account/fundraisers' }, 'Fundraisers'),
          a({ href: '#contributions' }, 'Contributions'),
          a({ href: '#solutions' }, 'Solutions'),

          a({ href: '#account' }, 'Account'),
          a({ href: BountySource.logout }, 'Logout'))
      );
    });

    return user_nav;
  });

  define('default_layout', function(yield) {
    if (!scope.rendered_default_layout) {
      scope.rendered_default_layout_inner = section({ id: 'content' });
      scope.rendered_default_layout = section({ id: 'wrapper' },
        div({ id: 'fb-root' }),

        div({ id: 'forkme' },
          a({ href: "https://github.com/bountysource/frontend", target: '_blank' },
            img({ src: "images/forkme.png", alt: "Fork me on GitHub"})
          )
        ),

        header(
          section(
            div({ style: 'display: inline-block; vertical-align: middle;' },
              h1(a({ href: '#' }, img({ style: 'margin-left: 20px; vertical-align: middle;', src: 'images/logo-beta.png' })))
            ),

            ul({ style: 'display: inline-block;' },
              li(a({ href: '#about' }, 'About')),
              li(a({ href: '#faq' }, 'FAQ')),
              li(a({ href: 'mailto:support@bountysource.com' }, 'Contact Us')),
              //li(a({ href: '#' }, 'Blog')),

              logged_in() ? [
                li({ id: 'notification-feed-target' }),
                li(user_nav)
              ] : [
                li(a({ href: '#signin' }, 'Sign In'))
              ]
            )
          )
        ),

        section({ id: 'global-social-buttons' }),

        div({ id: 'before-content'}),

        scope.rendered_default_layout_inner,

        footer(
          div({ style: 'float: right' },
            "BountySource is a part of ", a({ href: 'https://www.badger.com/' }, 'Badger Inc.'), " Copyright ©2012, Badger Inc. All rights reserved. "
          ),
          ul(
            li(a({ href: '#termsofservice' }, 'Terms of Service')),
            li(a({ href: 'mailto:support@bountysource.com', target: '_blank' }, 'Contact Us'))
          )
        ),

        !test_mode && chatbar
      );
    }

    render({ into: scope.rendered_default_layout_inner }, yield);
    return scope.rendered_default_layout;
  });

  // render the notifications drop down on every page load
  after_filter(function() {
    if (logged_in()) render({ target: 'notification-feed-target' }, notifications_feed);
  });

  define('notifications_feed', function() {
    var arguments = flatten_to_array(arguments),
        options   = shift_options_from_args(arguments);

    options.id = 'notifications-feed';

    var notifications_feed = div(options,
      div({ id: 'feed-icon' },
        img({ src: 'images/users_32.gif' }),
        div({ id: 'notification-feed-count-wrapper' })
      ),

      div({ id: 'notifications-feed-flyout-outer' },
        div({ id: 'notifications-feed-flyout-inner' }, div({ style: 'text-align: center;' }, 'Loading...'))
      )
    );

    BountySource.get_friends_activity(function(response) {
      if (response.meta.success && response.data.length > 0) {
        // add a special class to adjust height to max once the API call is finished
        add_class(notifications_feed, 'loaded');

        render({ target: 'notification-feed-count-wrapper' }, span({ 'class': 'notification-feed-count' }, response.data.length));
        render({ target: 'notifications-feed-flyout-inner' }, response.data.map(notification));
      } else {
        render({ target: 'notifications-feed-flyout-inner' }, 'Nothing to show here!');
      }
    });

    // toggle show of feed on click
    notifications_feed.addEventListener('click', function() {
      has_class(this, 'active') ? remove_class(this, 'active') : add_class(this, 'active');
    });

    // clicking anywhere else closes it
    document.getElementById('content').addEventListener('click', function() {
      if (has_class(notifications_feed, 'active')) remove_class(notifications_feed, 'active');
    });

    return notifications_feed;
  });

  define('notification', function(object) {
    var message = "did something awesome!";
    var frontend_path;
    if (object.type == 'bounty') {
      message = 'placed a ' + money(object.amount) + ' bounty on ' + object.issue.title;
      frontend_path = object.issue.frontend_path;
    } else if (object.type == 'pledge') {
      message = 'pledged ' + money(object.amount) + ' to ' + object.fundraiser.title;
      frontend_path = object.fundraiser.frontend_path;
    } else if (object.type == 'fundraiser') {
      message = 'created a Fundraiser: '+object.title;
      frontend_path = object.frontend_path;
    }

    return div({ 'class': 'notification-message', onClick: curry(set_route, frontend_path) },
      a({ href: object.person.frontend_path },
        img({ 'class': 'notification-user', src: object.person.image_url })
      ),
      div({ 'class': 'notification-content' },
        a({ href: object.person.frontend_path, style: 'font-size: 12px;' }, span(object.person.display_name)), span(' ', message)
      )
    )
  });

  define('chatbar', function() {
    return div({ 'class': 'active minimized', id: 'chatbar' },
      a({ href: Chat.hide_chat, 'class': 'close-button' }, 'X'),
      a({ href: Chat.minimize_chat, 'class': 'close-button min-button' }, '–'),
      h2({ onclick: Chat.show_chat }, div({ style: 'text-align: center' }, 'Click to Chat (#bountysource on irc.freenode.net)')),
      div({ id: "chatbar-content" })
    );
  });

  // empty before-content prior to every rendering
  before_filter(function() {
    inner_html('before-content', '');
    show('before-content');
    show('content');
  });

  define('breadcrumbs', function() {
    var elements = [],
        active_element_index = null;
    for (var i=0; i < arguments.length; i++) {
      if (!active_element_index && arguments[i] && arguments[i].className == 'active') active_element_index = i;
      elements.push(span(
        span({ 'class': 'crumb' }, arguments[i]),
        (i < (arguments.length-1)) && span({ 'class': 'arrow' }, "»")
      ))
    }
//    elements.pop(); // shave off extra arrow

    active_element_index = (active_element_index || elements.length- 1);
    var  active_element = elements[active_element_index];

    // add the active last crumb. default is last crumb
    elements.splice(active_element_index, 1, span({ 'class': 'crumb' },
      active_element.childNodes[0],
      (active_element_index < (elements.length-1)) && span({ 'class': 'arrow' }, "»"),
      span({ 'class': 'uparrow' })
    ));

    return div({ id: 'breadcrumbs' }, elements);
  });

  define('ribbon_header', function(text) {
    return div({ 'class': 'ribbon-wrapper' },
      div({ 'class': 'ribbon-front' }, text),
      div({ 'class': 'ribbon-edge-bottomleft' }),
      div({ 'class': 'ribbon-edge-bottomright' })
    );
  });

  define('money', function(value, show_pennies) {
    var parts = parseFloat(value.toString()).toString().split('.');
    return '$' + formatted_number(parts[0]) + (show_pennies ? '.' + ((parts[1]||'') + '00').substr(0,2) : '');
  });

  define('formatted_number', function(value) {
    var parts = value.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  });

  define('code', function() {
    var args = Array.prototype.slice.call(arguments);
    return pre({ 'class': 'code' }, args.join("\n"));
  });

  define('percentage', function(value) {
    var parts = parseFloat(value.toString()).toString().split('.');
    return parts[0] + '.' + ((parts[1]||'') + '00').substr(0,2) + '%';
  });

  define('error_message', function() {
    var arguments = flatten_to_array(arguments),
        options   = shift_options_from_args(arguments);
    return message(merge({ 'class': 'error-message' }, options), arguments);
  });

  define('success_message', function() {
    var arguments = flatten_to_array(arguments),
        options   = shift_options_from_args(arguments);
    return message(merge({ 'class': 'success-message' }, options), arguments);
  });

  define('info_message', function() {
    var arguments = flatten_to_array(arguments),
        options   = shift_options_from_args(arguments);
    return message(merge({ 'class': 'info-message' }, options), arguments);
  });

  define('small_error_message', function(options) {
    var arguments = flatten_to_array(arguments),
        options   = shift_options_from_args(arguments);
    return message(merge({ 'class': 'error-message small' }, options), arguments);
  });

  define('small_success_message', function() {
    var arguments = flatten_to_array(arguments),
        options   = shift_options_from_args(arguments);
    return message(merge({ 'class': 'success-message small' }, options), arguments);
  });

  define('small_info_message', function() {
    var arguments = flatten_to_array(arguments),
        options   = shift_options_from_args(arguments);
    return message(merge({ 'class': 'info-message small' }, options), arguments);
  });

  define('message', function() {
    var arguments = flatten_to_array(arguments),
        options   = shift_options_from_args(arguments);

    return div(options, arguments);
  });

  // it puts things inside of a grey box
  define('grey_box', function() {
    return div({ style: 'background: #eee; border: 1px solid #ccc; padding: 20px 10px;' }, arguments);
  });

  // include this element wherever you want to render messages on a page (errors, for instance)
  define('messages', function(options) {
    options = options || {};
    options.id = '_page-messages';
    return div(options);
  });

  // use this method to render into the messages div
  define('render_message', function() {
    render({ into: '_page-messages' }, arguments);
  });

  // use this method to clear the messages div
  define('clear_message', function() {
    render({ into: '_page-messages' }, '');
  });

  // abbreviate a body of text
  define('truncate', function(text, max_length) {
    text = text || '';
    max_length = max_length || 100;
    return (text.length > max_length) ? (text.substr(0,max_length-3) + '...') : text;
  });

  // a readonly input with a width that exactly fits the text.
  define('autosized_input', function(value) {
    var length_to_px_multiplier = 7.14285714285714;
    return input({
      'class': 'autosized',
      onClick: function(e){e.target.select()},
      readonly: true,
      value: value,
      style: 'width: '+(value.length*length_to_px_multiplier)+'px;'
    });
  });

  // render all of the child inputs with required markings
  define('required_inputs', function() {
    var arguments = flatten_to_array(arguments);
    for (var i=0; i<arguments.length; i++) {
      var child = arguments[i];
      // if child has it's own children, recurse!
      if (child.children.length > 0) {
        // turn node list into array of elements
        var elements = [];
        for (var j=0; j<child.children.length; j++) elements.push(child.children[j]);
        required_inputs(elements);
      } else if ((/input/i).test(child.tagName) && !child.value) {
        child.className.length > 0 ? child.className += ' required' : child.className = 'required';
        // when child loses focus, check to see if it is filled in to remove required border
        child.onblur = function(e) {
          if (e.target.value.length > 0) {
            e.target.className = e.target.className.replace(/required/,'');
          } else {
            child.className.length > 0 ? child.className += ' required' : child.className = 'required';
          }
        };
      }
    }
    return arguments;
  });
}

with (scope('Columns')) {
  define('create', function(options) {
    Columns._options  = { show_side: true };
    Columns._main     = div({ id: 'split-main' });
    Columns._side     = div({ id: 'split-side' });
    Columns._wrapper  = div({ id: 'split-wrapper' }, Columns._main, Columns._side);

    // merge into Columns options
    options = options || {};
    for (var k in options) {
      Columns._options[k] = options[k];
    }

    return Columns._wrapper;
  });

  define('main', function() {
    render({ into: Columns._main }, arguments);

    // hide the side by default
    if (!Columns._options.show_side) hide_side();
  });

  define('side', function() {
    render({ into: Columns._side }, arguments);
  });

  define('show_side', function() {
    remove_class(Columns._main, 'expanded');
    remove_class(Columns._side, 'collapsed');
  });

  define('hide_side', function() {
    add_class(Columns._main, 'expanded');
    add_class(Columns._side, 'collapsed');
  });
}

with (scope('Split')) {
  initializer(function() {
    Split._main     = div({ id: 'split-main' });
    Split._side     = div({ id: 'split-side' });
    Split._wrapper  = div({ id: 'split-wrapper' }, Split._main, Split._side);
  });

  define('create', function() {
    return Split._wrapper;
  });

  define('main', function() {
    render({ into: Split._main }, arguments);
  });

  define('side', function() {
    render({ into: Split._side }, arguments);
  });

  define('show_side', function() {
    remove_class(Split._main, 'expanded');
    remove_class(Split._side, 'collapsed');
  });

  define('hide_side', function() {
    add_class(Split._main, 'expanded');
    add_class(Split._side, 'collapsed');
  });
}
