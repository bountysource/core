with (scope('App')) {
  // End point for Github login.
  route ('#login/:access_token', function(access_token) {
    Storage.set('access_token',access_token);
    set_route(Storage.remove('_redirect_to_after_login') || '#');
  });

  define('code', function() {
    return pre({ 'class': 'code' }, arguments);
  });

  define('shy_form', function(id) {
    var the_form = form(arguments),
        wrapper = div({ id: 'shy-form-wrapper-'+id }, the_form);
    the_form.onsubmit = function(e) { wrapper.style.display = 'none'; var wait = document.getElementById('shy-form-waiting-'+id); if (wait) wait.style.display = ''; };
    return wrapper;
  });

  define('shy_form_during_submit', function(id) {
    return div({ id: 'shy-form-waiting-'+id, style: 'display: none' }, div(arguments));
  });

  define('show_shy_form', function(id) {
    document.getElementById('shy-form-wrapper-'+id).style.display = '';
    var wait = document.getElementById('shy-form-waiting-'+id);
    if (wait) wait.style.display = 'none';
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

};
