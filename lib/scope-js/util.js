with (scope()) {
  define('redefine', function(name, callback) {
    var real_callback = this[name];
    define(name, function() {
      return callback.apply(this, [real_callback].concat(Array.prototype.slice.call(arguments)));
    });
  });

  define('stop_event', function(e) {
    if (!e) return;
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    e.cancelBubble = true;
    e.returnValue = false;
  });
  
  define('flatten_to_array', function() {
    var stack = Array.prototype.slice.call(arguments);
    var arguments = [];
    while (stack.length > 0) {
      var obj = stack.shift();
      if ((typeof(obj) == 'object') && obj.concat) {
        // array? just concat
        stack = obj.concat(stack);
      } else if (((typeof(obj) == 'object') && obj.callee) || (Object.prototype.toString.call(obj).indexOf('NodeList') >= 0)) {
        // explicitly passed arguments or childNodes object? to another function
        stack = Array.prototype.slice.call(obj).concat(stack);
      } else if (['undefined','boolean'].indexOf(typeof(obj)) == -1) {
        arguments.push(obj);
      }
    }
    return arguments;
  });

  define('shift_options_from_args', function(args) {
    if ((typeof(args[0]) == 'object') && (typeof(args[0].nodeType) == 'undefined')) {
      return args.shift();
    } else if ((typeof(args[args.length-1]) == 'object') && (typeof(args[args.length-1].nodeType) == 'undefined')) {
      return args.pop();
    } else {
      return {};
    }
  });

  define('shift_callback_from_args', function(args) {
    if (typeof(args[0]) == 'function') {
      return args.shift();
    } else if (typeof(args[args.length-1]) == 'function') {
      return args.pop();
    } else {
      return (function(){});
    }
  });
  
  define('for_each', function() {
    var objs = flatten_to_array(arguments);
    var callback = objs.pop();
    var ret_val = [];
    for (var i=0; i < objs.length; i++) ret_val.push(callback(objs[i]));
    return ret_val;
  });
  
  define('curry', function(callback) {
    var curried_args = Array.prototype.slice.call(arguments,1);
    return (function() {
      return callback.apply(this, Array.prototype.concat.apply(curried_args, arguments));
    });
  });  
  
  // expects an iteratable array
  define('filter', function(iteratable, callback) {
    var retval = [];
    for (var i=0; i < iteratable.length; i++) if (callback(iteratable[i])) retval.push(iteratable[i]);
    return retval;
  });
}
