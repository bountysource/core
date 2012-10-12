with (scope('Cookies')) {
  define('get', function(name) {
    var ca = document.cookie.split(';');
    for (var i=0; i < ca.length; i++) {
      while (ca[i].charAt(0)==' ') ca[i] = ca[i].substring(1,ca[i].length);
      if (ca[i].length > 0) {
        var kv = ca[i].split('=');
        if (kv[0] == name) return kv[1];
      }
    }
  });

  define('set', function(name, value, options) {
    options = options || {};
    var cookie = (value ? name+"="+value+"; path=/;" : name+"=; path=/;");
    if (options.expires_at) cookie += "expires="+options.expires_at.toGMTString();
    document.cookie = cookie;
  });

  define('remove', function(name) {
    var before_remove = get(name);
    if (before_remove) {
      document.cookie=name+"="+";path="+";expires=Thu, 01 Jan 1970 00:00:01 GMT";
      return before_remove;
    }
  });

  define('clear', function() {
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
      var name = ca[i].split('=')[0].replace(/\s+/,'');
      remove(name);
    }
  });
}

with (scope('Local')) {
  define('get', function(name) {
    return window.localStorage.getItem(name);
  });

  define('set', function(name, value) {
    window.localStorage.setItem(name, value);
  });

  define('remove', function(name) {
    var before_remove = get(name);
    if (before_remove) {
      window.localStorage.removeItem(name);
      return before_remove;
    }
  });

  define('clear', function() {
    window.localStorage.clear();
  });
}

scope('Storage', (document.location.protocol == 'file:' || /\.dev$/.test(document.domain)) ? 'Local' : 'Cookies');
