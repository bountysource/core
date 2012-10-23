with (scope('Github','App')) {
  define('auth_url', function(options) {
    options = options || {};

    var original_route = ('#'+document.location.href.split('#').slice(-1)[0]);
    options.redirect_url = (document.location.origin+'/'+original_route);

    var url = BountySource.api_host+'auth/github';

    if (Storage.get('access_token')) {
      return url + '?access_token='+Storage.get('access_token')+'&redirect_url='+options.redirect_url;
    } else {
      return url + '?redirect_url='+options.redirect_url;
    }
  });

  // funnel through Github, to require app link if needed
  define('link_requiring_auth', function(options, text) {
    options = options || {};

    var original_route = '#'+(options.href||get_route()).split('#').slice(-1)[0];

    // if not logged in, save the intended href, and replace with auth url.
    // when auth returns, pick off the href and set_route there
    if (!github_account_linked()) options.href = auth_url();

    var the_link =  a(options, text);
    the_link.onclick = function() { Storage.set('_redirect_to_after_login', original_route) };
    return the_link;
  });
};