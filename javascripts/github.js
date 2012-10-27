with (scope('Github','App')) {
  define('auth_url', function(options) {
    options = options || {};

    var url = BountySource.api_host+'auth/github';

    if (logged_in()) {
      return url + '?access_token='+Storage.get('access_token')+'&redirect_url='+document.location.href;
    } else {
      return url + '?redirect_url='+document.location.href;
    }
  });

  // funnel through Github, to require app link if needed
  define('link_requiring_auth', function(options, text) {
    options = options || {};

    // if not logged in, save the intended href, and replace with auth url.
    // when auth returns, pick off the href and set_route there
    if (!github_account_linked()) options.href = auth_url();

    var the_link = a(options, text);
    the_link.addEventListener('click', save_route_for_redirect);
    return the_link;
  });
};