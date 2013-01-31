with (scope('App')) {

  define('test_mode', !!window.navigator.userAgent.match('Selenium'));

  // refresh user_info and access_token if they're logged in
  initializer(function() {
    if (Storage.get('access_token')) {
      BountySource.user_info(function(results) {
        BountySource.set_access_token(results.data);
      });
    }
  });

  // update social buttons
  after_filter(function() {
    render({ target: 'global-social-buttons' },
      ul(
        li({ style: 'height: 20px;' }, Twitter.follow_button),
        // li({ style: 'height: 20px;' }, Facebook.follow_button),
        li({ style: 'height: 20px;' }, Twitter.share_button),
        li({ style: 'width: 100px;' }, Facebook.like_button({ 'data-layout': 'button_count', style: 'z-index: 3;' })),
        li(GooglePlus.like_button)
      )
    );
    Twitter.process_elements();
    GooglePlus.process_elements();
    Facebook.process_elements();
  });

  /*
   * Get the pretty route, which uses the base string, with a character white listed version of the
   * source string appended to it.
   *
   * Example Usage:
   *
   * pretty_route('#fundraisers/1/', 'My awesome fundraiser: it is URL safe ______waste__of___space______')
   *  //=> '#fundraisers/1/my-awesome-fundraiser-it-is-url-safe-waste-of-space'
   *
   * pretty_route('#fundraisers/1/', 'My awesome fundraiser: it is URL safe ______waste__of___space______', 30)
   *  //=> '#fundraisers/1/my-awesome'
   *  // doesn't append 'fundraiser' because that would put the route length over 30 characters
   * */
  define('pretty_url', function(base_string, source_string, max_route_length) {
    var parts           = (source_string.split(/\s+/)),
        new_route_parts   = [],
        route             = base_string,
        new_part;

    // add title parts onto route until length at max
    while (parts.length > 0 && (new_route_parts.join('-').length + route.length) <= (max_route_length || 100)) {
      new_part = parts.shift();
      new_part = new_part.replace(/[^0-9a-z\-_]/gi,''); // white list URL safe characters
      new_part = new_part.replace(/(-|_){1,}/g, '-');   // reduce duplicate hyphens, replace underscores with hyphens

      // lower case dat part
      if (!new_part.match(/^-$/)) new_route_parts.push(new_part.toLowerCase());
    }
    return base_string+(new_route_parts.join('-')).toLowerCase();
  });

  define('time_ago_in_words', function(time) {
    var distance_in_milliseconds = (typeof(time) == "string" ? (new Date(time)) : time) - (new Date());
    var distance_in_minutes = parseInt(Math.abs(distance_in_milliseconds / 60000));
    var words = "";

    if (distance_in_minutes == 0) {
      words = "less than a minute";
    } else if (distance_in_minutes == 1) {
      words = "1 minute";
    } else if (distance_in_minutes < 45) {
      words = distance_in_minutes + " minutes";
    } else if (distance_in_minutes < 90) {
      words = "about 1 hour";
    } else if (distance_in_minutes < 1440) {
      words = "about " + parseInt(distance_in_minutes / 60) + " hours";
    } else if (distance_in_minutes < 2160) {
      words = "about 1 day";
    } else if (distance_in_minutes < 43200) {
      words = parseInt(distance_in_minutes / 1440) + " days";
    } else if (distance_in_minutes < 86400) {
      words = "about 1 month";
    } else if (distance_in_minutes < 525600) {
      words = parseInt(distance_in_minutes / 43200) + " months";
    } else if (distance_in_minutes < 1051200) {
      words = "about 1 year";
    } else {
      words = "over " + parseInt(distance_in_minutes / 525600) + " years";
    }

    return words;
  });

  define('date', function(date_string) {
    var d = new Date(date_string),
        month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][d.getMonth()];
    return month + ' ' + d.getDate() + ', ' + d.getFullYear();
  });

  // use to check logged in
  define('logged_in', function() {
    return Storage.get('access_token');
  });

  // requires login. if not logged in, redirects to #login and returns true
  // returns true if not logged in, false otherwise.
  define('require_login', function() {
    if (logged_in()) {
      return false;
    } else {
      unauthorized_callback();
    }
  });

  // requires user to have created a BountySource account
  define('require_account_creation', function() {
    if (logged_in()) {
      return false;
    } else {
      unauthorized_callback();
    }
  });

  // remove a DOM element
  define('remove_element', function(id) {
    var e = document.getElementById(id);
    return (e ? (e.parentNode.removeChild(e) && true) : false);
  });

  // add class to element
  define('add_class', function(element, class_name) {
    if (!element || has_class(element, class_name)) return element;
    var parts = element.className.split(/\s+/);
    parts.push(class_name);
    element.className = parts.join(' ');
    return element;
  });

  // remove class from element
  define('remove_class', function(element, class_name) {
    if (!element || !has_class(element, class_name)) return element;
    element.className = element.className.replace((new RegExp(class_name)),'').trim();
    return element;
  });

  // check if element has class
  define('has_class', function(element, class_name) {
    var class_names = element.className.split(/\s+/);
    return class_names.indexOf(class_name) >= 0;
  });

  // create a progress bar. to change the percentage, adjust the width of the element created with id
  // @id the id of the progress bar element
  define('progress_bar', function(options) {
    var inner       = div({ 'class': 'progress-bar-inner' }),
        outer       = div({ 'class': 'progress-bar-outer' }, inner),
        percentage  = (parseFloat(options.percentage)||0);

    // don't go over 100%
    if (percentage > 100) percentage = 100;

    inner.style.width = percentage+'%';
    return outer;
  });

  // this is called by the api when missing authorization for a request.
  define('unauthorized_callback', function(request) {
    Storage.clear({ except: ['environment'] });
    Storage.set('_redirect_to_after_login', get_route());
    set_route('#signin', { reload_page: true });
  })
};
