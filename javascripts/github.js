with (scope('Github','App')) {
  define('auth_url', function(options) {
    options = options || {};
    return BountySource.api_host+'auth/github?scope='+(options.scope||'') +
      '&access_token='+(Storage.get('access_token')||'') +
      '&redirect_url='+window.location.href; // make sure the redirect url is the last param?
  });

  // funnel through Github, to require app link if needed
  define('link_requiring_auth', function(options, text) {
    options = options || {};
    return a({ 'class': 'green', href: auth_url(options), onclick: save_route_for_redirect }, text);
  });
};