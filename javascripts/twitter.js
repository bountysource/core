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

  // after render, reload any twitter elements
  after_filter('parse_twitter_elements', function() {
    if (window.twttr && window.twttr.widgets) window.twttr.widgets.load();
  });

  /*
   * DOM Helpers
   * */

  define('share_button', function(options) {
    return div(options,
      a({
        'class':      'twitter-share-button',
        'data-lang':  'en',
        href:         'https://twitter.com/share?url=https://www.bountysource.com&text=The funding platform for open-source software | @BountySource'
      })
    );
  });

  define('follow_button', function(options) {
    return div(options,
      a({
        'class':            'twitter-follow-button',
        href:               'https://twitter.com/BountySource',
        'data-show-count':  'true'
      })
    )
  });
};