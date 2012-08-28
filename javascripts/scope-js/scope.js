var scope = function(namespace, base) {
  if (namespace) {
    if (base && !scope.instance[base]) {
      alert('Invalid scope parent: ' + base);
    } else {
      if (!scope.instance[namespace]) scope.instance[namespace] = scope.create_context(base ? scope.instance[base] : scope.instance);
      //scope.instance[namespace].__scope__ = namespace;
      return scope.instance[namespace];
    }
  } else {
    return scope.instance;
  }
};

// for live dom observers
scope.data_logs = [];
scope.data_observers = [];
scope.data_hash = {};  

scope.create_context = function(proto) {
  function Scope() {};
  Scope.prototype = proto;
  var obj = new Scope();
  if (!obj.__proto__) obj.__proto__ = proto;
  return obj;
};

scope.instance = scope.create_context({
  define: function(key, callback) {
    this[key] = callback;
  }
});