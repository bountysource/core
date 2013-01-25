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
      if (obj || (typeof(obj) == 'number')) {
        if ((typeof(obj) == 'object') && obj.concat) {
          // array? just concat
          stack = obj.concat(stack);
        } else if (((typeof(obj) == 'object') && obj.callee) || (Object.prototype.toString.call(obj).indexOf('NodeList') >= 0)) {
          // explicitly passed arguments or childNodes object? to another function
          stack = Array.prototype.slice.call(obj).concat(stack);
        } else {
          arguments.push(obj);
        }
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

  // encode html string
  define('encode_html', function(string) {
    if (is_html_encoded(string)) return string;
    return encodeURIComponent(string);
  });

  // decode an already encoded html string
  define('decode_html', function(encoded_html) {
    return decodeURIComponent(encoded_html)
  });

  // check to see if it is already encoded
  define('is_html_encoded', function(string) {
    return decode_html(string) != string;
  });

  // serialize the inputs of a form to JSON
  define('serialize_form', function(form) {
    if (typeof(form) == 'string') form = document.getElementById(form);
    if (!form) return;
    var inputs = [];
    flatten_to_array(form.getElementsByTagName('input')).map(function(input) {
      if (input.type == 'text')
        inputs.push({ type: 'text', name: input.name, value: input.value });
      else if (input.type == 'checkbox')
        inputs.push({ type: 'checkbox', name: input.name, value: input.value });
    });
    flatten_to_array(form.getElementsByTagName('textarea')).map(function(textarea) {
      inputs.push({ type: 'textarea', name: textarea.name, value: textarea.value });
    });
    flatten_to_array(form.getElementsByTagName('select')).map(function(select) {
      var selected_option = select.options[select.options.selectedIndex];
      inputs.push({ type: 'select', name: select.name, value: selected_option.value });
    });
    return inputs;
  });

  // merge one hash into another. non-destructive. values in b will overwrite those in a.
  define('merge', function(a, b) {
    var new_hash = {};
    for (var k in a) new_hash[k] = a[k];
    for (var k in b) new_hash[k] = b[k];
    return new_hash;
  })
}
