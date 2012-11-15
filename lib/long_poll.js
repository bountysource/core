// execute a method in timed intervals. use method chaining to define functionality,
// then execute with start()
//
// EXAMPLE:
// LongPoll.execute(my_method).every(5000).while(condition_method).start();
with (scope('LongPoll')) {
  define('execute', function(method) {
    return {
      _method:            method,
      _interval:          1000,
      _condition:         function() { return true; },
      _current_interval:  null,
      // set the interval
      every: function(t) { if (t) this._interval = t; return this; },
      // provide a function to run every iteration. return value of false stops the poll.
      while: function(fn) { if (fn) this._condition = fn; return this; },
      // only runs the poll on this page.
      on_this_page: function() {
        this._on_this_page_only = true;
        this._page_href         = window.location.href;
        return this;
      },
      // start the poll!
      start: function() {
        with (this) { _current_interval = setInterval(function() { _condition.call() ? _method.call() : stop(); }, _interval) }
        return this;
      },
      // manually stop the poll, if you saved it to a variable.
      stop: function() { clearInterval(this._current_interval); return this; }
    };
  });
}
