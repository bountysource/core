with (scope('NotificationFeed', 'App')) {
  // render the notifications drop down on every page load
  after_filter(function() {
    if (logged_in()) render({ target: 'notification-feed-target' }, notifications_feed);
  });

  define('create', function() {
    var arguments = flatten_to_array(arguments),
        options   = shift_options_from_args(arguments);

    options.id = 'notifications-feed';

    var flyout = div({ id: 'notifications-feed-flyout-outer' },
      div({ id: 'notifications-feed-flyout-inner' }, div({ style: 'text-align: center;' }, 'Loading...'))
    );

    var notifications_feed = div(options,
      div({ id: 'feed-icon' },
        img({ src: 'images/users_32.gif' }),
        div({ id: 'notification-feed-count-wrapper' })
      ),
      flyout
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

    notifications_feed.addEventListener('mouseover', expand_flyout_listener);
    notifications_feed.addEventListener('mouseout', retract_flyout_listener);

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

  // User nav flyout events
  define('expand_flyout_listener', function(e) {
    add_class(this, 'active');

    if (this.flyout_timeout) {
      clearTimeout(this.flyout_timeout);
      delete this.flyout_timeout;
    }
  });

  define('retract_flyout_listener', function(e) {
    var notifications_wrapper = this;
    if (this.flyout_timeout) clearTimeout(this.flyout_timeout);
    this.flyout_timeout = setTimeout(function() {
      remove_class(notifications_wrapper, 'active');
    }, 250);
  });
}