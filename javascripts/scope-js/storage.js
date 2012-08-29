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
}

with (scope('Local')) {
  define('get', function(name) {
    return window.localStorage.getItem(name);
  });

  define('set', function(name, value) {
    window.localStorage.setItem(name, value);
  });
}


scope('Storage', (document.location.protocol == 'file:' || /\.dev$/.test(document.domain)) ? 'Local' : 'Cookie');


// // Temporarily store data in session.
// // Uses the Session object defined in session.js.
// // Stores stringified data in window.name
// Session: {
//   // show everything that is currently saved to the session.
//   // only really useful for debugging.
//   inspect: function() {
//     var sessionVars = {};
//     var keys = Object.keys(Session).slice(1);      
//     
//     for (i in keys) {
//       if (key = keys[i]) sessionVars[key] = Session[key];
//     }
//     
//     return sessionVars;
//   },
//   
//   // write the variable to session variables.
//   write: function(sessvars) {
//     for (k in sessvars) {
//       Session[k] = sessvars[k];
//     }
//   },
//   
//   set: function(key,value) {
//     Session[key] = value;
//   },
//   
//   // read the key/value from session and return value
//   // if multiple keys provided, returns a hash of key => value
//   get: function() {
//     if (arguments.length == 1) {
//       var key = arguments[0];
//       return Session[key];
//     }
//     
//     var sessionVars = {};
//     for (var i = 0; i < arguments.length; i++) {
//       var key = arguments[i];
//       sessionVars[key] = Session[key];
//     }
//     return sessionVars;
//   },
//   
//   // delete the key/value from session and return value
//   // if multiple keys provided, returns a hash of key => value
//   remove: function() {
//     if (arguments.length == 1) {
//       var key = arguments[0];
//       var value = Session[key];
//       delete Session[key];
//       return value;
//     }
//     
//     var sessionVars = {};
//     for (var i = 0; i < arguments.length; i++) {
//       var key = arguments[i];
//       var value = Session[key];
//       delete Session[key];
//       sessionVars[key] = value;
//     }
//     return sessionVars;
//   },
//   
//   clear: function() {
//     var keys = Object.keys(Session).slice(1);
//     for (i in keys) {
//       delete Session[keys[i]];
//     }
//   }
// },


