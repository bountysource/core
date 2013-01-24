with (scope('GooglePlus','App')) {

  initializer(function() {
    (function() {
      var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
      po.src = 'https://apis.google.com/js/plusone.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
    })();
  });

  // parse any google plus elements that have been inserted into the DOM
  define('process_elements', function() {
    window.gapi && window.gapi.plusone && window.gapi.plusone.go();
  });

  /*
  * Attributes: https://developers.google.com/+/plugins/+1button/#plusonetag-parameters
  * */
  define('like_button', function(options) {
    options = options || {};
    options['class']            = 'g-plusone';
    options['data-size']        = options['data-size']        || 'medium';
    options['data-href']        = options['data-href']        || window.location.href;
    options['data-annotation']  = options['data-annotation']  || 'bubble';
    return div(options);
  })
}