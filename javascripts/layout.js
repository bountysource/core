with (scope('App')) {
  define('default_layout', function(yield) {
    if (!scope.rendered_default_layout) {
      scope.rendered_default_layout_inner = section({ id: 'content' });
      scope.rendered_default_layout = section({ id: 'wrapper' },
        div({ id: 'fb-root' }),

        Header.create(),

        // Global message flasher
        div({ id: 'global-notice-wrapper' }),

        div({ id: 'before-content'}),

        scope.rendered_default_layout_inner,

        footer(
          div({ style: 'float: right' }, "Copyright ©2013, Bountysource Inc. All rights reserved."),
          ul(
            //li(a({ href: '#about' }, 'About')),
            li(a({ href: '#faq' }, 'FAQ')),
            li(a({ target: '_blank', href: 'http://blog.bountysource.com/' }, 'Blog')),
            li(a({ href: 'mailto:support@bountysource.com' }, 'Contact Us')),
            li(a({ href: '#termsofservice' }, 'Terms of Service')),
            li(a({ href: '#privacypolicy' }, 'Privacy Policy'))
          )
        ),

        !test_mode && chatbar
      );
    }

    render({ into: scope.rendered_default_layout_inner }, yield);
    return scope.rendered_default_layout;
  });

  define('chatbar', function() {
    return div({ 'class': 'active minimized', id: 'chatbar' },
      a({ href: Chat.hide_chat, 'class': 'close-button' }, 'X'),
      a({ href: Chat.minimize_chat, 'class': 'close-button min-button' }, '–'),
      h2({ onclick: Chat.show_chat }, div({ style: 'text-align: center' }, 'Click to Chat (#bountysource on irc.freenode.net)')),
      div({ id: "chatbar-content" })
    );
  });

  // empty before-content prior to every rendering
  before_filter(function() {
    inner_html('before-content', '');
    show('before-content');
    show('content');
  });

  define('breadcrumbs', function() {
    var elements = [],
        active_element_index = null;
    for (var i=0; i < arguments.length; i++) {
      if (!active_element_index && arguments[i] && arguments[i].className == 'active') active_element_index = i;
      elements.push(span(
        span({ 'class': 'crumb' }, arguments[i]),
        (i < (arguments.length-1)) && span({ 'class': 'arrow' }, "»")
      ))
    }
//    elements.pop(); // shave off extra arrow

    active_element_index = (active_element_index || elements.length- 1);
    var  active_element = elements[active_element_index];

    // add the active last crumb. default is last crumb
    elements.splice(active_element_index, 1, span({ 'class': 'crumb' },
      active_element.childNodes[0],
      (active_element_index < (elements.length-1)) && span({ 'class': 'arrow' }, "»"),
      span({ 'class': 'uparrow' })
    ));

    return div({ id: 'breadcrumbs' }, elements);
  });

  define('ribbon_header', function(text) {
    return div({ 'class': 'ribbon-wrapper' },
      div({ 'class': 'ribbon-front' }, text),
      div({ 'class': 'ribbon-edge-bottomleft' }),
      div({ 'class': 'ribbon-edge-bottomright' })
    );
  });

  define('money', function(value, show_pennies) {
    var parts = parseFloat(value.toString()).toString().split('.');
    return '$' + formatted_number(parts[0]) + (show_pennies ? '.' + ((parts[1]||'') + '00').substr(0,2) : '');
  });

  define('formatted_number', function(value) {
    var parts = value.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  });

  define('code', function() {
    var args = Array.prototype.slice.call(arguments);
    return pre({ 'class': 'code' }, args.join("\n"));
  });

  define('percentage', function(value) {
    var parts = parseFloat(value.toString()).toString().split('.');
    return parts[0] + '.' + ((parts[1]||'') + '00').substr(0,2) + '%';
  });

  define('error_message', function() {
    var arguments = flatten_to_array(arguments),
        options   = shift_options_from_args(arguments);
    return message(merge({ 'class': 'error-message' }, options), arguments);
  });

  define('success_message', function() {
    var arguments = flatten_to_array(arguments),
        options   = shift_options_from_args(arguments);
    return message(merge({ 'class': 'success-message' }, options), arguments);
  });

  define('info_message', function() {
    var arguments = flatten_to_array(arguments),
        options   = shift_options_from_args(arguments);
    return message(merge({ 'class': 'info-message' }, options), arguments);
  });

  define('small_error_message', function(options) {
    var arguments = flatten_to_array(arguments),
        options   = shift_options_from_args(arguments);
    return message(merge({ 'class': 'error-message small' }, options), arguments);
  });

  define('small_success_message', function() {
    var arguments = flatten_to_array(arguments),
        options   = shift_options_from_args(arguments);
    return message(merge({ 'class': 'success-message small' }, options), arguments);
  });

  define('small_info_message', function() {
    var arguments = flatten_to_array(arguments),
        options   = shift_options_from_args(arguments);
    return message(merge({ 'class': 'info-message small' }, options), arguments);
  });

  define('message', function() {
    var arguments = flatten_to_array(arguments),
        options   = shift_options_from_args(arguments);
    return div(options, arguments);
  });

  // it puts things inside of a grey box
  define('grey_box', function() {
    return div({ style: 'background: #eee; border: 1px solid #ccc; padding: 20px 10px;' }, arguments);
  });

  // include this element wherever you want to render messages on a page (errors, for instance)
  define('messages', function(options) {
    options = options || {};
    options.id = '_page-messages';
    return div(options);
  });

  // use this method to render into the messages div
  define('render_message', function() {
    render({ into: '_page-messages' }, arguments);
  });

  // use this method to clear the messages div
  define('clear_message', function() {
    render({ into: '_page-messages' }, '');
  });

  // abbreviate a body of text
  define('truncate', function(text, max_length) {
    text = text || '';
    max_length = max_length || 100;
    return (text.length > max_length) ? (text.substr(0,max_length-3) + '...') : text;
  });

  // a readonly input with a width that exactly fits the text.
  define('autosized_input', function(value) {
    var length_to_px_multiplier = 7.14285714285714;
    return input({
      'class': 'autosized',
      onClick: function(e){e.target.select()},
      readonly: true,
      value: value,
      style: 'width: '+(value.length*length_to_px_multiplier)+'px;'
    });
  });

  // render all of the child inputs with required markings
  define('required_inputs', function() {
    var arguments = flatten_to_array(arguments);
    for (var i=0; i<arguments.length; i++) {
      var child = arguments[i];
      // if child has it's own children, recurse!
      if (child.children.length > 0) {
        // turn node list into array of elements
        var elements = [];
        for (var j=0; j<child.children.length; j++) elements.push(child.children[j]);
        required_inputs(elements);
      } else if ((/input/i).test(child.tagName) && !child.value) {
        child.className.length > 0 ? child.className += ' required' : child.className = 'required';
        // when child loses focus, check to see if it is filled in to remove required border
        child.onblur = function(e) {
          if (e.target.value.length > 0) {
            e.target.className = e.target.className.replace(/required/,'');
          } else {
            child.className.length > 0 ? child.className += ' required' : child.className = 'required';
          }
        };
      }
    }
    return arguments;
  });

  with (scope('SliderWithInput')) {
    initializer(function() {
      // custom event for change
      SliderWithInput.change_event = document.createEvent('Event');
      SliderWithInput.change_event.initEvent("SliderWithInputChange",true,true);
    });

    // start refactor of slide shit
    define('create', function(options) {
      var arguments = flatten_to_array(arguments);
      var options   = shift_options_from_args(arguments);

      options['class'] = 'range';
      var range_element = range(options);

      // copy over min, max, and step from options
      var input_options = {};
      for (var k in options) {
        if (['min', 'max', 'step'].indexOf(k) >= 0) input_options[k] = options[k]
      }
      input_options['class'] = 'number';
      var input_element = number(input_options);

      // init input element value to range value
      input_element.value = range_element.value;

      range_element.style.width           = '340px';
      range_element.style['margin-right'] = '10px';

      // fuck it, just hide the input because it is cents
      input_element.style.display = 'none';
      input_element.style.width           = '75px';
      input_element.style['font-size']    = '16px';

      // displayed amount span. converts cents to dollaz
      var display_element = div({ style: 'display: inline-block; text-align: right; margin-right: 5px; width: 75px; font-size: 18px; vertical-align: middle;' }, money(input_element.value, true));

      // listen for input change to update range
      var input_listener = function() {
        if (this.type == 'number' || this.type == 'text') {
          range_element.value = isNaN(parseInt(this.value)) ? 0 : this.value;
        } else if (this.type == 'range') {
          input_element.value = this.value;
        }
        this.dispatchEvent(SliderWithInput.change_event);
      }

      // listen for range change to update number input
      range_element.addEventListener('change', input_listener);
      input_element.addEventListener('change', input_listener);
      input_element.addEventListener('keyup', input_listener);

      var range_with_input = div({ 'class': 'range-with-input' }, display_element, input_element, range_element);

      range_with_input.display_element = display_element;
      range_with_input.input_element = input_element;
      range_with_input.range_element = range_element;

      return range_with_input;
    });
  }

  with (scope('SliderGroup')) {
    define('create', function() {
      var sliders = flatten_to_array(arguments);
      var options = shift_options_from_args(sliders);

      // nothing to do if a group of 1
      if (sliders.length < 1) return;

      // shared max, min for all sliders.
      var max = parseInt(options.max);
      var min = parseInt(options.min||0.0);

      // for each slider, add a change listener, and modify the other sliders if need be
      for (var i=0; i<sliders.length; i++) {
        // other sliders, excluding those of zero value
        sliders[i].other_sliders = sliders.slice(0,i).concat(sliders.slice(i+1));

        sliders[i].addEventListener('SliderWithInputChange', function() {
          // only select sliders with value > 0
          var affected_sliders = [];
          for (var j=0; j<this.other_sliders.length; j++) {
            if ((parseInt(this.other_sliders[j].range_element.value) || 0) > 0) {
              affected_sliders.push(this.other_sliders[j]);
            }
          }

          // calculate the total of the other sliders
          var other_slider_sum = 0;
          for (var j=0; j<affected_sliders.length; j++) {
            other_slider_sum += (parseInt(affected_sliders[j].input_element.value) || 0.0);
          }

          var this_slider_value = (parseInt(this.range_element.value) || 0.0);
          var slider_value_sum  = other_slider_sum + this_slider_value;

          // update the slider with slider_group_value
          this.slider_group_sum = other_slider_sum + this_slider_value;

          if (slider_value_sum > max) {
            // pennies, use Math.round to keep things in integers
            // var decrease_amount = Math.abs((slider_value_sum - max) / affected_sliders.length);
            var decrease_amount = Math.abs(Math.round((slider_value_sum - max) / affected_sliders.length));

            // decrease value of other sliders
            var other_slider_value, new_value;

            for (var j=0; j<affected_sliders.length; j++) {
              other_slider_value = parseInt(affected_sliders[j].range_element.value);

              if (other_slider_value > 0) {
                new_value = Math.abs(other_slider_value - decrease_amount);

                if (this_slider_value == max) new_value = 0;
                if (new_value < 0)    new_value = 0;
                if (new_value > max)  new_value = max;

                // update both range and input
                affected_sliders[j].range_element.value = new_value;
                affected_sliders[j].input_element.value = new_value;
              }
            }
          }
        });
      }

      return sliders;
    });
  }

  with (scope('Columns')) {
    define('create', function(options) {
      Columns._options  = { show_side: true };
      Columns._main     = div({ id: 'split-main' });
      Columns._side     = div({ id: 'split-side' });
      Columns._wrapper  = div({ id: 'split-wrapper' }, Columns._main, Columns._side);

      // merge into Columns options
      options = options || {};
      for (var k in options) {
        Columns._options[k] = options[k];
      }

      return Columns._wrapper;
    });

    define('main', function() {
      render({ into: Columns._main }, arguments);

      // hide the side by default
      if (!Columns._options.show_side) hide_side();
    });

    define('side', function() {
      render({ into: Columns._side }, arguments);
    });

    define('show_side', function() {
      remove_class(Columns._main, 'expanded');
      remove_class(Columns._side, 'collapsed');
    });

    define('hide_side', function() {
      add_class(Columns._main, 'expanded');
      add_class(Columns._side, 'collapsed');
    });
  }

}

