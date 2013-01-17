with (scope('Facebook','App')) {
  Facebook.facebook_sdk_loaded = false;

  // add FB JS library
  initializer(function() {
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/all.js#xfbml=0&appId=280280945425178";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  });

  /*
   * DOM helpers
   * */

  // auto-parsed by FB library
  define('like_button', function(options) {
    return process_facebook_element(div(options || {},
      div({
        'class': 'fb-like',
        'data-href': "http://www.facebook.com/BountySource",
        'data-send': 'false',
        'data-width': '500px;',
        'data-show-faces': 'false'
      })
    ));
  });

  define('process_facebook_element', function(elem) {
    if (window.FB) {
      window.FB.XFBML.parse(elem);
    } else {
      var previous_async = window.fbAsyncInit;
      window.fbAsyncInit = function() {
        if (previous_async) previous_async.call();
        window.FB.XFBML.parse(elem);
      };
    }
    return elem;
  });

  define('share_dialog_url', function(options) {
    var options = options || {};
    return "https://www.facebook.com/dialog/feed?"
      + "app_id="           + 280280945425178
      + "&display="         + "popup"
      + "&link="            + options.link
      + "&redirect_uri="    + encode_html(BountySource.api_host+"kill_window_js")
      + "&name="            + options.title||''
      + "&caption="         + "BountySource is a funding platform for open-source bugs and features."
      + "&description="     + options.description||'';
  });

  define('share_dialog_button', function(dialog_url, button_text) {
    return a({ 'class': 'btn-auth btn-facebook', href: function() { window.open(dialog_url,'','width=680,height=350') } }, button_text || 'Share');
  });
};