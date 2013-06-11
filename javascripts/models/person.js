with (scope('Person', 'Bountysource')) {

  define('find', function(id) {
    JSONP.get({ url: url+'/'+id, callback: function(response) {
      console.log(response);
    }});
  });

  define('github_auth_url', function(options) {
    options = options || {};
    return Bountysource.api_host+'auth/github?scope='+(options.scope||'') +
      '&access_token='+(get('person') ? get('person').access_token : '') +
      '&redirect_url='+encode_html(window.location.href); // make sure the redirect url is the last param?
  });

  define('facebook_auth_url', function(options) {
    options = options || {};
    return Bountysource.api_host+'auth/facebook?scope='+(options.scope||'email') +
      '&access_token='+(get('person') ? get('person').access_token : '') +
      '&redirect_url='+encode_html(window.location.href); // make sure the redirect url is the last param?
  });

  define('twitter_auth_url', function(options) {
    options = options || {};
    return Bountysource.api_host+'auth/twitter?scope='+(options.scope||'') +
      '&access_token='+(get('person') ? get('person').access_token : '') +
      '&redirect_url='+encode_html(window.location.href); // make sure the redirect url is the last param?
  });

}