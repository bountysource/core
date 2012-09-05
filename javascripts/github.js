with (scope('Github')) {
  // funnel through Github, to require app link if needed
  define('link_requiring_auth', function(options) {
    options = options || {};
    var url;
    if (Storage.get('access_token')) {
      url = options.route || get_route();
    } else {
      url = BountySource.api_host + 'auth/github?redirect_url='+document.location.href;
      Storage.set('__return_route__', options.route || get_route()); // redirect back to the page the link was clicked on
    }
    return a({ href: url }, options.text);
  });
};