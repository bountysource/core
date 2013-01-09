with (scope('Facebook','App')) {
  Facebook.facebook_sdk_loaded = false;

  // add FB JS library
  initializer(function() {
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=280280945425178";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  });

  /*
   * DOM helpers
   * */

  // auto-parsed by FB library
  define('like_button', function(options) {
    return div(options || {},
      div({
        'class': 'fb-like',
        'data-href': "http://www.facebook.com/BountySource",
        'data-send': 'false',
        'data-width': '500px;',
        'data-show-faces': 'false'
      })
    );
  });
};