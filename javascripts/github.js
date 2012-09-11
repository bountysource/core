with (scope('Github')) {
  // funnel through Github, to require app link if needed
  define('link_requiring_auth', function(options) {
    options = options || {};
    if (Storage.get('access_token')) {
      options.href = options.route || get_route();
    } else {
      options.href = BountySource.api_host + 'auth/github?redirect_url='+document.location.href;
      Storage.set('__return_route__', options.route || get_route()); // redirect back to the page the link was clicked on
    }

    var text = options.text;
    delete options.text;
    return a(options, text);
  });
};