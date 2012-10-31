with (scope('JSONP')) {

  initializer(function() {
    scope.jsonp_callback_sequence = 0;
    scope.jsonp_callbacks = {};
  });

  // usage: JSONP.get({ url: ..., method: ..., callback: ..., params: ... });
  define('get', function(options) {
    var callback_name = 'callback_' + scope.jsonp_callback_sequence++;

    var url = options.url;

    // default params
    if (!options.params) options.params = {};
    options.params.cache = (new Date().getTime());
    options.params.callback = 'scope.jsonp_callbacks.' + callback_name;
    if (options.method != 'GET') options.params._method = options.method;

    // params to url string
    for (var key in options.params) {
      url += (url.indexOf('?') == -1 ? '?' : '&');
      url += key + '=' + encode_html(options.params[key]||'');
    }

    // TODO: alert if url is too long
    var script = document.createElement("script");        
    script.async = true;
    script.type = 'text/javascript';
    script.src = url;

    scope.jsonp_callbacks[callback_name] = function(response) {
      delete scope.jsonp_callbacks[callback_name];
      var head = document.getElementsByTagName('head')[0];
      head.removeChild(script);
      options.callback.call(null,response);
    };

    var head = document.getElementsByTagName('head')[0];
    head.appendChild(script);
  });
  
}
