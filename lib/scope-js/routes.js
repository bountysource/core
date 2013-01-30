scope.routes = [];

with (scope()) {
  // check for new routes on the browser bar every 100ms
  initializer(function() {
    var callback = function() {
      setTimeout(callback, 100);
      var hash = get_route();
      if (hash != scope.current_route) set_route(hash, { skip_updating_browser_bar: true });
    }
    
    // run once all other initializers finish
    setTimeout(callback, 0);
  });
 
  // define a route
  //   route('#', function() {})  or  route({ '#': function(){}, '#a': function(){} })
  define('route', function(path, callback) {
    if (typeof(path) == 'string') {
      scope.routes.push({
        regex: (new RegExp("^" + path.replace(/^#\//,'#').replace(/:[a-z_]+/g, '([^/]*)') + '$')),
        callback: callback,
        context: this
      });
    } else {
      for (var key in path) {
        this.route(key, path[key]);
      }
    }
  });

  // return the current route as a string from browser bar (#/foo becomes #foo)
  define('get_route', function() {
    var r = '#' + ((window.location.href.match(/#\/?(.*)/)||[])[1] || '').split('?')[0];
    return r;
  });

  // return a hash of params for URLS like:   #some/url?param1=foobar
  define('get_params', function() {
    var hash = {};
    var qs = ((window.location.href.match(/#?\/?.*?\?(.*)/)||[])[1] || '');
    var pairs = qs.split('&');
    for (var i=0; i < pairs.length; i++) {
      var target = hash;
      var kv = pairs[i].split('=',2);
      if (kv.length != 2) continue;

      var this_value = unescape(kv[1]);
      if (this_value == 'true') this_value = true;
      else if (this_value == 'false') this_value = false;

      // handle nested hashes and arrays in params
      var key_parts = unescape(kv[0]).split('[');
      for (var j=0; j < key_parts.length; j++) {
        var this_key = key_parts[j].replace(/\]$/,'');
        var next_key = (key_parts.length > j+1) ? key_parts[j+1].replace(/\]$/,'') : null;
        
        // if there's not a next_key set the value... otherwise go a level deeper inception-style
        if (next_key == null) {
          if (this_key == '') target.push(this_value);
          else target[this_key] = this_value;
        } else {
          if (!target[this_key]) target[this_key] = (next_key == '' ? [] : {});
          target = target[this_key];
        }
      }
    }
    return hash;
  });

  define('to_param', function(params) {
    var qs = "";
    for (var k in params) qs += ((qs.length == 0 ? '?' : '&') + k + '=' + params[k]);
    return qs;
  });

  define('set_route', function(path, options) {
    // absolute URL?
    if (!path.match(/^#/)) {
      if (window.location.href.split('#')[0] == path.split('#')[0]) {
        path = '#'+path.split('#',2)[1];
      } else {
        window.location.href = path;
        return;
      }
    }
    
    // strip leading slash (#/foo --> #foo) 
    path = path.replace(/^#\//,'#');
    
    // super hax to fix layout bug
    if (document.getElementById('_content')) {
      document.getElementById('_content').setAttribute('id','content');
    }
    
    if (!options) options = {};

    if (options.params) {
      if (query_string) path = path.split('?')[0];
      path += to_param(options.params);
    }

    if (!options.skip_updating_browser_bar) {
      if (options.replace) {
        window.location.replace(window.location.href.split('#')[0] + path);
      } else {
        window.location.href = window.location.href.split('#')[0] + path;
      }
    }
    scope.current_route = path;

    if (options.reload_page) {
      window.location.reload();
      return;
    }
    
    // register a pageview with google analytics
    if (typeof(_gaq) == 'object') _gaq.push(['_trackPageview', path]);

    // replace path variable with get_route's logic to strip query params
    path = get_route();

    for (var i=0; i < scope.routes.length; i++) {
      var route = scope.routes[i];
      var matches = path.match(route.regex);
      if (matches) {
        // scroll to the top of newly loaded page --- CAB
        window.scrollTo(0, 0);
        
        if (!route.context.run_filters('before')) return;
        route.callback.apply(null, matches.slice(1));
        route.context.run_filters('after');
        return;
      }
    }

    // page not found
    for (var i=0; i < scope.routes.length; i++) {
      var route = scope.routes[i];
      var matches = '#not_found'.match(route.regex);
      if (matches) {
        // scroll to the top of newly loaded page --- CAB
        window.scrollTo(0, 0);
        
        if (!route.context.run_filters('before')) return;
        route.callback.apply(null, matches.slice(1));
        route.context.run_filters('after');
        return;
      }
    }

    // not found and no #not_found route
    alert('404 not found: ' + path);
  });
}