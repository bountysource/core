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

  define('share_button', function(options, share_url_options) {
    var share_url = share_dialog_url(share_url_options||{
      url:  encode_html('https://www.bountysource.com'),
      text: "The funding platform for open-source software | @BountySource"
    });

    return process_twitter_element(div(options,
      a({
        'class':      'twitter-share-button',
        'data-lang':  'en',
        href:         share_url
      })
    ));
  });


  // auto-parsed by FB library
  define('like_button', function(options, like_options) {
    like_options = like_options || {};
    return process_facebook_element(div(options||{},
      div({
        'class': 'fb-like',
        'data-href': like_options.link || "http://www.facebook.com/BountySource",
        'data-send': 'false',
        'data-width': (like_options.width||500)+'px',
        'data-show-faces': like_options.show_faces || 'false'
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