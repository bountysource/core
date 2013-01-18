with (scope('Twitter','App')) {
  // add Twitter JS library
  // WARNING: magical obfuscated JavaScript
  initializer(function() {
    window.twttr = (function (d,s,id) {
      var t, js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return; js=d.createElement(s); js.id=id;
      js.src="//platform.twitter.com/widgets.js"; fjs.parentNode.insertBefore(js, fjs);
      return window.twttr || (t = { _e: [], ready: function(f){ t._e.push(f);} });
    }(document, "script", "twitter-wjs"));
  });

  /*
   * DOM Helpers
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
        'data-count':  share_url_options.show_count ? 'horizontal' : 'none',
        href:         share_url
      })
    ));
  });

  define('follow_button', function(options) {
    return process_twitter_element(div(options,
      a({
        'class':            'twitter-follow-button',
        href:               'https://twitter.com/BountySource',
        'data-show-count':  'true'
      })
    ));
  });

  define('process_twitter_element', function(elem) {
    if (window.twttr.widgets) {
      window.twttr.widgets.load(elem);
    } else {
      window.twttr.ready(function() {
        setTimeout(function() {
          window.twttr.widgets.load(elem);
        },0);
      });
    };
    return elem;
  });

  define('share_dialog_url', function(options) {
    var options = options || {};
    return "https://twitter.com/share?"
      + "via="    + "BountySource"
      + "&url="   + options.url
      + "&text="  + options.text||''
  });

  define('share_dialog_button', function(dialog_url, button_text) {
    return a({ 'class': 'btn-auth btn-twitter', href: function() { window.open(dialog_url,'','width=680,height=350') } }, button_text || 'Share');
  })
};