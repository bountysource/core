with (scope('Twitter','App')) {
  // add Twitter JS library
  initializer(function() {
    window.twttr = (function (d,s,id) {
      var t, js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return; js=d.createElement(s); js.id=id;
      js.src="//platform.twitter.com/widgets.js"; fjs.parentNode.insertBefore(js, fjs);
      return window.twttr || (t = { _e: [], ready: function(f){ t._e.push(f);} });
    }(document, "script", "twitter-wjs"));
  });

  // parse any twitter elements that have been inserted into the DOM
  define('process_elements', function() {
    if (window.twttr.widgets) {
      window.twttr.widgets.load();
    } else {
      window.twttr.ready(function() {
        setTimeout(function() {
          window.twttr.widgets.load();
        },0);
      });
    };
  });

  /*
   * Attributes:
   * data-url
   * data-via - append 'via @UserName' to end of tweet
   * data-text
   * data-related
   * data-count - none, horizontal, vertical
   * data-lang
   * data-counturl - URL to which your shared URL resolves
   * data-hashtags -
   * data-size - medium (default), large
   * data-dnt - https://dev.twitter.com/docs/tweet-button#optout
   * */
  define('share_button', function(options) {
    options = options || {};
    options['class']      = 'twitter-share-button';
    options['href']       = 'https://twitter.com/share';
    options['data-lang']  = 'en';
    options['data-text']  = "I <3 OSS";
    options['data-url']   = window.location.href;
    return a(options);
  });

  define('follow_button', function(options) {
    options = options || {};
    options['class'] = 'twitter-follow-button';
    options['href']  = 'https://twitter.com/BountySource';
    return a(options);
  });

  /*
  * ********************************************************
  *
  * These are deprecated. Use share_button and follow_button with their appropriate data attributes.
  * TODO: go update/remove all usages of this.
  *
  * ********************************************************
  * */
  define('share_dialog_url', function(options) {
    options = options || {};
    return "https://twitter.com/share?"
      + "via="    + "BountySource"
      + "&url="   + options.url||encode_html(window.location.href)
      + "&text="  + options.text||'The funding platform for open-source software'
  });

  define('share_dialog_button', function(dialog_url, button_text) {
    return a({ 'class': 'btn-auth btn-twitter', href: function() { window.open(dialog_url,'','width=680,height=350') } }, button_text || 'Share');
  })
};