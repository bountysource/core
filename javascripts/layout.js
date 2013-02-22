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
          img({ id: 'user_nav_avatar', src: user.avatar_url }),
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
    render({ target: 'notification-feed-target' }, notifications_feed);
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
        div({ id: 'notifications-feed-flyout-header' }, span('Recent Friend Activity')),
        div({ id: 'notifications-feed-flyout-inner' }, div({ style: 'text-align: center;' }, 'Loading...'))
      )
    );

    BountySource.get_friends_activity(function(response) {
      // add a special class to adjust height to max once the API call is finished
      add_class(notifications_feed, 'loaded');

      if (response.meta.success && response.data.length > 0) {
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

    return notifications_feed;
  });

  define('notification', function(object) {
    var message = "did something awesome!";
    if (object.type == 'bounty') {
      message = 'placed a ' + money(object.amount) + ' bounty on ' + object.issue.title;
    } else if (object.type == 'pledge') {
      message = 'pledged ' + money(object.amount) + ' to ' + object.fundraiser.title;
    } else if (object.type == 'fundraiser') {
      message = 'created a Fundraiser: '+object.title;
    }

    return div({ 'class': 'notification-message', onClick: curry(set_route, object.href) },
      a({ href: object.person.profile_url },
        img({ 'class': 'notification-user', src: object.person.avatar_url })
      ),
      div({ 'class': 'notification-content' },
        a({ href: object.person.profile_url, style: 'font-size: 12px;' }, span(object.person.display_name)), span(' ', message)
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
  define('abbreviated_text', function(text, max_length) {
    max_length = max_length || 100;
    return (text.length > max_length) ? (text.substr(0,max_length) + '...') : text;
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


  /*
   * Define a group of ranges. The will all scale to the same max set in the options.
   * If you add a tax attribute to the range, it will set the min value of the range accordingly.
   *
   * NOTE: Make sure you add an element with id 'total-cut' somewhere. This will be updated the total amount
   * remaining after donations/taxes are applied.
   *
   * Options:
   * @data-tax -   A float, representing percentage of the max to set the min.
   * @max -        The max value for all ranges in the group.
   *
   * Arguments:
   * The remaining arguments are the name attributes of the ranges you want to include in the group
   * */
  define('donation_slider_group', function() {
    var arguments =           flatten_to_array(arguments),
      options =             shift_options_from_args(arguments),
      difference_element =  document.getElementById(options.difference_element_id);

    // collect all of the specified slider elements
    var all_sliders = [];
    for (var arg in arguments) all_sliders.push(document.getElementsByName(arguments[arg])[0]);

    // helper function. get all the sliders in the group except for the one specified
    var get_other_sliders = function(target_element) {
      var other_sliders = [];
      for (var slider in all_sliders) if (target_element != all_sliders[slider]) other_sliders.push(all_sliders[slider]);
      return other_sliders;
    };

    // helper function. get the sum of the min values of sliders in the group
    var sum_slider_mins = function(group) {
      var sum = 0;
      for (var index in group) sum += parseInt(group[index].getAttribute('min')||0);
      return sum;
    };

    // helper function. sum the values of the sliders in the group
    var sum_slider_values = function(group) {
      var sum = 0;
      for (var index in group) sum += parseInt(group[index].value||0);
      return sum;
    };

    // helper function. adjust the difference view without showing negatives
    var set_difference_element = function(n) { if (difference_element) difference_element.innerHTML = money(n > 0 ? n : 0) };
    var set_input_value = function(n, input) { input.value = formatted_number(n > 0 ? Math.ceil(n) : 0) }

    // helper function. adjust the value of all sliders
    var adjust_slider_values = function(amount, group) {
      for (var i=0; i < group.length; i++) {
        group[i].value = parseInt(group[i].value) + amount;
        // also need to adjust the input
        set_input_value(parseInt(group[i].value), get_input_from_slider(group[i]));
      }
      // recalculate the difference_element
      if (difference_element) set_difference_element(options.max - sum_slider_values(all_sliders));
    };

    // for each slider specified
    for (i=0; i < all_sliders.length; i++) {
      var this_slider = all_sliders[i];

      // set min from tax attribute if present. also make initial value the taxed value, or zero.
      this_slider.setAttribute('min', (this_slider.getAttribute('data-tax')) ? (parseFloat(this_slider.getAttribute('data-tax'))*options.max) : 0);
      this_slider.setAttribute('value', this_slider.getAttribute('min'));

      // default value for the input
      get_input_from_slider(this_slider).setAttribute('value',  parseInt(this_slider.getAttribute('value')) || 0);

      // on slider change...
      this_slider.addEventListener('change', function(e) {
        // collect the other sliders that are not this one.
        var other_sliders = get_other_sliders(e.target),
          other_slider_min_sum = sum_slider_mins(other_sliders);

        // add max now if missing, since it doesn't work to do it before (maybe it can, this is quicker though)
        if (!e.target.getAttribute('max')) e.target.setAttribute('max', (options.max - other_slider_min_sum));

        // when the this_slider changes, show the value in the input
        set_input_value(e.target.value, get_input_from_slider(e.target));

        // check this value + sum of the other sliders
        var other_sliders_total = sum_slider_values(other_sliders);

        // change the other slider values if need be
        if (parseInt(e.target.value) + other_sliders_total > options.max) {
          // collect the other sliders with positive values
          var other_sliders_with_value = [];
          for (var i in other_sliders) {
            if (parseInt(other_sliders[i].value) > parseInt(other_sliders[i].min)) other_sliders_with_value.push(other_sliders[i]);
          }

          // calculate the amount to step down by on other sliders
          var amount_over = ((parseInt(e.target.value) + other_sliders_total) - options.max);

          // adjust the other sliders by that amount
          adjust_slider_values((-1 * amount_over / (other_sliders_with_value.length)), other_sliders_with_value);
        }

        // update the sum element if it was added to the page
        if (difference_element) set_difference_element(options.max - (other_sliders_total + parseInt(e.target.value)));
      });

      // default value for sum element
      if (difference_element) difference_element.innerHTML = money(options.max - sum_slider_values(all_sliders))
    }

    return all_sliders;
  });

  // HTML5 slider helper
  define('donation_slider', function(options) {
    var unique_bit = Math.ceil(new Date().getTime() * Math.random());

    options['id'] = '_slider-'+unique_bit;
    options['class'] = 'donation-slider';
    options['value'] = 0;
    options['step'] = 1;
    var dat_range = range(options),
      range_input = text({ id: '_input-'+unique_bit, style: 'width: 65px; color: #9C9999;', value: 0, readonly: true });

    return div({ style: 'display: inline-block;' },
      div({ style: 'margin-right: 5px; display: inline;' }, dat_range), span({ style: 'font-size: 25px; vertical-align: middle; padding-right: 5px;' }, '$'), range_input
    );
  });

  define('get_input_from_slider', function(slider_element) {
    return document.getElementById('_input-'+slider_element.getAttribute('id').split('-').slice(-1));
  });

  define('get_slider_from_input', function(input_element) {
    return document.getElementById('_slider-'+input_element.getAttribute('id').split('-').slice(-1));
  });
}
