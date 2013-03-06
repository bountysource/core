with (scope('SliderWithInput')) {
  initializer(function() {
    // custom event for change
    SliderWithInput.change_event = document.createEvent('Event');
    SliderWithInput.change_event.initEvent("SliderWithInputChange",true,true);
  });

  // start refactor of slide shit
  define('create', function(options) {
    var arguments = flatten_to_array(arguments),
      options   = shift_options_from_args(arguments);

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
    input_element.style.width           = '75px';
    input_element.style['font-size']    = '16px';

    // listen for input change to update range
    var input_listener = function() {
      if (this.type == 'number' || this.type == 'text') {
        range_element.value = isNaN(parseFloat(this.value)) ? 0 : this.value;
      } else if (this.type == 'range') {
        input_element.value = this.value;
      }
      this.dispatchEvent(SliderWithInput.change_event);
    }

    // listen for range change to update number input
    range_element.addEventListener('change', input_listener);
    input_element.addEventListener('change', input_listener);
    input_element.addEventListener('keyup', input_listener);

    var range_with_input = div({ 'class': 'range-with-input' }, input_element, range_element);

    range_with_input.input_element = input_element;
    range_with_input.range_element = range_element;

    return range_with_input;
  });
}

with (scope('SliderGroup')) {
  define('create', function() {
    var sliders = flatten_to_array(arguments),
        options = shift_options_from_args(sliders);

    // nothing to do if a group of 1
    if (sliders.length < 1) return;

    // shared max, min for all sliders.
    var max = parseFloat(options.max),
        min = parseFloat(options.min||0.0);

    // for each slider, add a change listener, and modify the other sliders if need be
    for (var i=0; i<sliders.length; i++) {
      // other sliders, excluding those of zero value
      sliders[i].other_sliders = sliders.slice(0,i).concat(sliders.slice(i+1));

      sliders[i].addEventListener('SliderWithInputChange', function() {
        // only select sliders with value > 0
        var affected_sliders = [];
        for (var j=0; j<this.other_sliders.length; j++) {
          if ((parseFloat(this.other_sliders[j].range_element.value) || 0) > 0) {
            affected_sliders.push(this.other_sliders[j]);
          }
        }

        // calculate the total of the other fundraisers
        var other_slider_sum = 0;
        for (var j=0; j<affected_sliders.length; j++) {
          other_slider_sum += (parseFloat(affected_sliders[j].input_element.value) || 0.0);
        }

        var this_slider_value = (parseFloat(this.range_element.value) || 0.0),
            slider_value_sum  = other_slider_sum + this_slider_value;

        // update the slider with slider_group_value
        this.slider_group_sum = other_slider_sum + this_slider_value;

        if (slider_value_sum > max) {
          var decrease_amount = Math.abs((slider_value_sum - max) / affected_sliders.length);
          // decrease value of other sliders
          var other_slider_value, new_value;

          for (var j=0; j<affected_sliders.length; j++) {
            other_slider_value = parseFloat(affected_sliders[j].range_element.value);

            if (other_slider_value > 0) {
              new_value = Math.abs(other_slider_value - decrease_amount).toFixed(2);
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
