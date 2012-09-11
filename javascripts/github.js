with (scope('Github')) {
  // funnel through Github, to require app link if needed
  define('link_requiring_auth', function(options, text) {
    options = options || {};

    var original_href = '#'+options.href.split('#').slice(-1)[0];

    // if not logged in, save the intended href, and replace with auth url.
    // when auth returns, pick off the href and set_route there
    if (!Storage.get('access_token')) {
      options.href = BountySource.api_host + 'auth/github?redirect_url='+document.location.href;
    }

    var the_link =  a(options, text);
    the_link.onclick = function() { Storage.set('__return_route__', original_href) };
    return the_link;
  });
};