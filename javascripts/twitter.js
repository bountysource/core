with (scope('Twitter','App')) {
  // add Twitter JS library
  initializer(function() {
    if (test_mode) return;

    window.twttr = (function (d,s,id) {
      var t, js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return; js=d.createElement(s); js.id=id;
      js.src="//platform.twitter.com/widgets.js"; fjs.parentNode.insertBefore(js, fjs);
      return window.twttr || (t = { _e: [], ready: function(f){ t._e.push(f);} });
    }(document, "script", "twitter-wjs"));

    var push_gaq_social_event = function(e) {
      var url = decode_html(e.target.src).match(/url=(.*)&?/)[1];

      if (!e) { return; }
      _gaq.push(['_trackSocial', 'twitter', e.type, url||'']);
    }
    bind_event('click', push_gaq_social_event);
    bind_event('tweet', push_gaq_social_event);
    bind_event('follow', push_gaq_social_event);
    bind_event('retweet', push_gaq_social_event);
    bind_event('favorite', push_gaq_social_event);
  });

  define('bind_event', function(event, callback) {
    after_loaded(function(twttr) {
      twttr.events.bind(event, callback);
    });
  });

  // parse any twitter elements that have been inserted into the DOM
  define('process_elements', function() {
    if (test_mode) return;

    after_loaded(function(twttr) {
      twttr.widgets.load();
    });
  });

  define('after_loaded', function(callback) {
    if (test_mode) callback();

    if (window.twttr.widgets) {
      callback(window.twttr);
    } else {
      window.twttr.ready(function() {
        setTimeout(function() {
          callback(window.twttr);
        },10);
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
    options['class']          = 'twitter-share-button';
    options['href']           = 'https://twitter.com/share';
    options['data-lang']      = 'en';
    options['data-text']      = options['data-text']      || "I <3 OSS";
    options['data-url']       = options['data-url']       || window.location.href;
    options['data-counturl']  = options['data-counturl']  || options['data-url'];
    return a(options);
  });

  define('follow_button', function(options) {
    options = options || {};
    options['class'] = 'twitter-follow-button';
    options['href']  = 'https://twitter.com/Bountysource';
    return a(options);
  });

  /*
  * Craft a share button, optionally passing an element you want to use as the button.
  * reference: https://dev.twitter.com/docs/tweet-button
  *
  * Params: [options] [button_element]
  * @options - optional hash of tweet button attributes.
  *   default url   - window.location.href
  *   default text  - @BountySource | The funding platform for open source software
  * @button_element - A DOM element, to which a click listener is attached.
  *   default - anchor element with 'btn-auth btn-twitter' class
  * */
  define('create_share_button', function() {
    var arguments = flatten_to_array(arguments),
        options   = shift_options_from_args(arguments),
        e         = arguments[0] || a({ 'class': 'btn-auth btn-twitter' }, 'Tweet');

    e.addEventListener('click', function(e) {
      options['url']      = encode_html(options['url']  || window.location.href);
      options['counturl'] = encode_html(options['counturl'] || options['url']);
      options['text']     = encode_html(options['text'] || '@Bountysource | The funding platform for open source software');
      window.open('https://twitter.com/share'+to_param(options),'','width=680,height=350');
    });

    return e;
  });

  /*
   * Link Twitter to BountySource account via oauth redirect.
   * */
  define('auth_url', function(options) {
    options = options || {};
    return Bountysource.api_host+'auth/twitter?scope='+(options.scope||'') +
      '&access_token='+(Storage.get('access_token')||'') +
      '&redirect_url='+encode_html(window.location.href); // make sure the redirect url is the last param?
  });
};