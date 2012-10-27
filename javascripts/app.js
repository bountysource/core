with (scope('App')) {
  // End point for Github login.
  route ('#login/:access_token', function(access_token) {
    Storage.set('access_token',access_token);
    BountySource.basic_user_info(function(response) {
      if (response.meta.success) BountySource.set_cached_user_info(response.data);
      redirect_to_saved_route();
    });
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
  define('save_route_for_redirect', function() { Storage.set('_redirect_to_after_login', get_route()); });
  define('redirect_to_saved_route', function() { set_route(Storage.get('_redirect_to_after_login') ? Storage.remove('_redirect_to_after_login') : '#', { reload_page: true }) });

  // use to check logged in. if passed a callback, execute that if logged in (passing access token as argument)
  define('logged_in', function(callback) {
    return callback ? callback(Storage.get('access_token')) : Storage.get('access_token');
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

  // requires user to be logged in, and have a GitHub account linked
  define('github_account_linked', function(callback) {
    if (!logged_in()) return false;
    var user_info = JSON.parse(Storage.get('user_info')||'{}');
    if (user_info) {
      return callback ? callback(user_info.github_user, user_info) : user_info.github_user;
    } else {
      return callback ? callback(null) : false;
    }
  });

  // requires user to have created a BountySource account
  define('require_account_creation', function() {
    save_route_for_redirect();
    set_route('#create_account?required=true');
  });
};
