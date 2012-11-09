with (scope('Github','App')) {
  define('auth_url', function(options) {
    options = options || {};
    return BountySource.api_host+'auth/github?scope='+(options.scope||'') +
      '&access_token='+(Storage.get('access_token')||'') +
      '&redirect_url='+encode_html(window.location.href); // make sure the redirect url is the last param?
  });

  // funnel through Github, to require app link if needed
  define('link_requiring_auth', function(options, text) {
    options = options || {};
    return a({ 'class': 'green', href: auth_url(options), onclick: curry(save_route_for_redirect, null) }, text);
  });

  // requires user to be logged in, and have a GitHub account linked
  define('account_linked', function() {
    if (!logged_in()) return false;
    var user_info = JSON.parse(Storage.get('user_info')||'{}');
    return user_info.github_user || null;
  });

  // route through github authorization, requiring public_repo permission
  define('require_permissions', function() {
    var arguments = flatten_to_array(arguments),
        callback = shift_callback_from_args(arguments),
        needed_permissions = arguments,
        necessary_auth_url = auth_url({ scope: needed_permissions });

    if (!account_linked()) {
      callback(false, necessary_auth_url);
    } else {
      BountySource.get_cached_user_info(function(user_info) {
        // loop through permissions, check if all accounted for
        var authorized = true;
        for (var i=0; authorized && i<needed_permissions.length; i++) {
          authorized = user_info.github_user.permissions.indexOf(needed_permissions[i]) >= 0;
        }
        callback(authorized, necessary_auth_url);
      });
    }
  });
};