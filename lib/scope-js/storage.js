with (scope('StorageBase')) {
  define('namespaced', function(name) {
    return Storage.namespace ? Storage.namespace + '_' + name : name;
  });
}

with (scope('Cookies', 'StorageBase')) {
  define('get', function(name) {
    var ca = document.cookie.split(';');
    for (var i=0; i < ca.length; i++) {
      while (ca[i].charAt(0)==' ') ca[i] = ca[i].substring(1,ca[i].length);
      if (ca[i].length > 0) {
        var kv = ca[i].split('=');
        if (kv[0] == namespaced(name)) return unescape(kv[1]);
      }
    }
  });

  define('set', function(name, value, options) {
    options = options || {};
    var cookie = (value ? namespaced(name)+"="+escape(value)+"; path=/;" : namespaced(name)+"=; path=/;");
    if (options.expires_at) cookie += "expires="+options.expires_at.toGMTString();
    document.cookie = cookie;
  });

  define('remove', function(name) {
    var before_remove = get(name);
    if (before_remove) {
      document.cookie=namespaced(name)+"="+";path="+";expires=Thu, 01 Jan 1970 00:00:01 GMT";
      return before_remove;
    }
  });

  define('clear', function(options) {
    options = options || {};
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
      var name = ca[i].split('=')[0].replace(/\s+/,'');
      if (!((options.except||[]).map(namespaced).indexOf(name) >= 0)) remove(name);
    }
  });
}

with (scope('Local', 'StorageBase')) {
  define('get', function(name) {
    return window.localStorage.getItem(namespaced(name));
  });

  define('set', function(name, value) {
    window.localStorage.setItem(namespaced(name), value);
  });

  define('remove', function(name) {
    var before_remove = get(name);
    if (before_remove) {
      window.localStorage.removeItem(namespaced(name));
      return before_remove;
    }
  });

  define('clear', function(options) {
    options = options || {};
    for (var attr in window.localStorage) {
      if (!((options.except||[]).map(namespaced).indexOf(attr) >= 0)) remove(attr);
    }
  });
}

scope('Storage', (document.location.protocol == 'file:' || /\.dev$/.test(document.domain)) ? 'Local' : 'Cookies');
