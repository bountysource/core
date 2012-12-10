with (scope('App')) {
  // if access token passed as query param, use it to log in
  before_filter(function() {
    var params = get_params();
    if (params.access_token) {
      Storage.set('access_token', params.access_token);
      BountySource.set_cached_user_info(null);

      // strip off query
      window.location.href = window.location.href.split('?')[0];
    }
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

  // save routes for redirect after login
  define('save_route_for_redirect', function(route) { Storage.set('_redirect_to_after_login', route || get_route()); });
  define('redirect_to_saved_route', function() {
    var route = Storage.remove('_redirect_to_after_login') || '#';
    set_route(route, { reload_page: true });
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
      save_route_for_redirect();
      window.location = '#login'; // faster?
      return true;
    }
  });

  // requires user to have created a BountySource account
  define('require_account_creation', function() {
    if (logged_in()) {
      return false;
    } else {
      save_route_for_redirect();
      set_route('#create_account');
    }
  });

  // remove a DOM element
  define('remove_element', function(id) {
    var e = document.getElementById(id);
    return (e ? (e.parentNode.removeChild(e) && true) : false);
  });

  define('add_class', function(element, class_name) {
    if (!element || !element.className) return;
    var parts = element.className.split(/\s+/)
    parts.push(class_name);
    element.className = parts.join(' ');
    return element;
  });

  define('remove_class', function(element, class_name) {
    if (!element || !element.className) return;
    element.className = element.className.replace((new RegExp(class_name)),'').trim();
    return element;
  });
};
