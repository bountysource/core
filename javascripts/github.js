with (scope('Github')) {
  // funnel through Github, to require app link if needed
  define('link_requiring_auth', function(options, text) {
    options = options || {};

    var original_route = '#'+options.href.split('#').slice(-1)[0];

    // if not logged in, save the intended href, and replace with auth url.
    // when auth returns, pick off the href and set_route there
    if (!Storage.get('access_token')) {
      options.href = BountySource.api_host + 'auth/github?redirect_url='+document.location.origin+'/'+original_route;
    }

    var the_link =  a(options, text);
    the_link.onclick = function() { Storage.set('_redirect_to_after_login', original_route) };
    return the_link;
  });
};