with (scope('App')) {

  define('test_mode', !!window.navigator.userAgent.match('Selenium'));

  // refresh user_info and access_token if they're logged in
  initializer(function() {
    BountySource.user_info(function(response) {
      if (response.meta.success) {
        BountySource.set_cached_user_info(response.data);
      }
    })
  });

  // update the FB like button in place with new meta data
  define('update_facebook_like_button', function(new_attributes) {
    return; // TODO bring back like button for every page

    new_attributes = new_attributes || {};
    render({ target: 'fb-like-button' }, Facebook.create_share_button(new_attributes));
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

  /*
  * Return the hours and minutes away from end_date
  * @end_date - a valid date string (not a Date object)
  *
  * example:
  * future_date = '2013-01-04 05:15:00 UTC';
  * # right now, the date is: 2013-01-04 03:00:00 UTC
  *
  * hours_and_minutes_from(future_date);
  * #=> { hours: 2, minutes: 15 }
  * */
  define('hours_and_minutes_from', function(end_date) {
    var total_minutes = ((new Date(end_date).getTime()) - (new Date().getTime())) / (1000*60);

    var hours   = Math.floor(total_minutes / 60);
    // don't fuck up because of % 0
    var minutes = Math.ceil(total_minutes % (hours * 60)) || Math.ceil(total_minutes % 60);

    return { hours: hours, minutes: minutes };
  });

  define('formatted_date', function(date_string) {
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
  });

}
