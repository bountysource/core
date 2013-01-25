with (scope('Facebook','App')) {
  var test_mode = window.navigator.userAgent == 'Selenium';

  // add FB JS library
  initializer(function() {
    if (test_mode) return;

    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/all.js#xfbml=0&appId=280280945425178";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    bind_event('edge.create', function(url) {
      _gaq.push(['_trackSocial', 'facebook', 'like', url]);
    });

    bind_event('edge.remove', function(url) {
      _gaq.push(['_trackSocial', 'facebook', 'unlike', url]);
    })
  });

  define('bind_event', function(event, callback) {
    after_loaded(function(FB) {
      FB.Event.subscribe(event, callback);
    });
  });

  // parse any facebook elements that have been inserted into the DOM
  define('process_elements', function() {
    if (test_mode) return;

    after_loaded(function(FB) {
      FB.XFBML.parse();
    });
  });

  define('after_loaded', function(callback) {
    if (test_mode) callback();

    if (window.FB) {
      callback(window.FB);
    } else {
      var previous_async = window.fbAsyncInit;
      window.fbAsyncInit = function() {
        if (previous_async) previous_async.call();
        callback(window.FB);
      };
    }
  });

  /*
  * Attributes:
  *
  * data-href - the URL to like. The XFBML version defaults to the current page.
  * data-send - specifies whether to include a Send button with the Like button. This only works with the XFBML version.
  * data-layout - there are three options.
  *   standard - displays social text to the right of the button and friends' profile photos below. Minimum
  *     width: 225 pixels. Minimum increases by 40px if action is 'recommend' by and increases by 60px if send is 'true'.
  *     Default width: 450 pixels. Height: 35 pixels (without photos) or 80 pixels (with photos).
  *   button_count - displays the total number of likes to the right of the button. Minimum width: 90 pixels. Default
  *     width: 90 pixels. Height: 20 pixels.
  *   box_count - displays the total number of likes above the button. Minimum width: 55 pixels. Default width:
  *     55 pixels. Height: 65 pixels.
  * data-show_faces - specifies whether to display profile photos below the button (standard layout only)
  * data-width - the width of the Like button.
  * data-action - the verb to display on the button. Options: 'like', 'recommend'
  * data-font - the font to display in the button. Options: 'arial', 'lucida grande', 'segoe ui', 'tahoma', 'trebuchet ms',
  *   'verdana'
  * data-colorscheme - the color scheme for the like button. Options: 'light', 'dark'
  * data-ref - a label for tracking referrals; must be less than 50 characters and can contain alphanumeric characters and
  *   some punctuation (currently +/=-.:_). The ref attribute causes two parameters to be added to the referrer URL
  *   when a user clicks a link from a stream story about a Like action:
  *
  *   fb_ref - the ref parameter
  *   fb_source - the stream type ('home', 'profile', 'search', 'ticker', 'tickerdialog' or 'other') in which the
  *     click occurred and the story type ('oneline' or 'multiline'), concatenated with an underscore.
  * */
  define('like_button', function(options) {
    options = options || {};
    options['class']            = 'fb-like';
    options['data-send']        = false;
    options['data-href']        = options['data-href']        || window.location.href;
    options['data-width']       = options['data-width']       || 500;
    options['data-show-faces']  = options['data-show-faces']  || true;
    return div(options);
  });

  define('follow_button', function(options) {
    options = options || {};
    options['class']            = 'fb-follow';
    options['data-href']        = options['data-href']        || 'http://www.facebook.com/BountySource';
    options['data-layout']      = options['data-layout']      || 'button_count';
    options['data-show-faces']  = options['data-show-faces']  || false
    return div(options);
  });

  /*
   * Craft a share button, optionally passing an element you want to use as the button.
   * reference: http://developers.facebook.com/docs/reference/javascript/FB.ui/
   *
   * Params: [options] [button_element]
   * @options - optional hash of share button attributes.
   *   default method   - feed
   *   default name     - 'BountySource'
   *   default link     - window.location.href
   *   default caption  - The funding platform for open source software
   * @button_element - A DOM element, to which a click listener is attached.
   *   default - anchor element with 'btn-auth btn-twitter' class
   * */
  define('create_share_button', function() {
    var arguments = flatten_to_array(arguments),
        options   = shift_options_from_args(arguments),
        element   = arguments[0] || a({ 'class': 'btn-auth btn-facebook' }, 'Share');

    options = options || {};
    options['method']   = 'feed';
    options['name']     = options['name']     || 'BountySource';
    options['link']     = options['link']     || window.location.href;
    options['caption']  = options['caption']  || 'The funding platform for open source software';

    !test_mode && element.addEventListener('click', curry(after_loaded, function(FB) { FB.ui(options) }));

    return element;
  });
};