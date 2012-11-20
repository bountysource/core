/*
* Table modification interface. It snuggles a table, allowing you to make changes to it through Teddy's warm embrace.
* */
with (scope('Teddy')) {
  define('snuggle', function(table_ref, options) {
    options = options || {};
    table_ref = (typeof(table_ref) == 'string') ? document.getElementById(table_ref) : table_ref;
    if (!table_ref || !table_ref.rows) return null; // break if not a table
    var rows = [];
    for (var i=0; i<table_ref.rows.length; i++) rows.push(table_ref.rows[i]);
    var head_row = (rows && rows.length > 0 && rows[0].getElementsByTagName('th').length > 0) ? rows[0] : null;

    table_ref._t           = table_ref;
    table_ref._t_style     = table_ref.style;
    table_ref._t_head_row  = head_row;
    table_ref._t_rows      = rows;

    // get the rows
    table_ref.rows    = function() { return this._t_rows };
    table_ref.length  = function() { return this._t_rows.length };

    /*
    * Shortcuts for first and last rows in table_ref
    * */
    table_ref.last  = function() { return this.at([this._t_rows.length-1]) };
    table_ref.first = function() { return this.at(0) };

    /*
    * Rebuild the table from _t_rows array. Much easier than using the DOM to create rows,
    * add cells, etc.
    * */
    table_ref._rebuild_table = function() {
      render({ into: this._t }, this._t_rows);
      return this;
    };

    /*
    * Specify the index to work on. Append actions to the element, and return it.
    * @params index the index to work on.
    * @return tr DOM element
    * */
    table_ref.at = function(index) {
      // if index is an element id, make it the index of that element in the rows array.
      if (typeof(index) == 'string') {
        for (var i=0; i<table_ref.length(); i++) if (table_ref._t_rows[i].id == index) index = i;
      }
      var row_element = table_ref._t_rows[index];
      if (!row_element) throw("Unable to find row at index '" + index + "'");

      /*
       * Add a row to the table. Options hash optional. Arguments are yielded
       * into a new tr (pass in td's, not a tr)
       *
       * OPTIONS:
       * @index index in table at which to insert row
       *
       * @return
       * */
      row_element.insert = function() {
        table_ref._t_rows.splice(index, 0, tr(arguments));
        table_ref._rebuild_table();
        return table_ref._t_rows[index];
      };

      /*
       * Replace row with a new one
       * @return the row that was added
       * */
      row_element.replace = function() {
        table_ref._t_rows.splice(index, 1, tr(arguments));
        table_ref._rebuild_table();
        return table_ref._t_rows[index];
      };

      /*
       * Delete row from table.
       * @return undefined
       * */
      row_element.remove = function() {
        table_ref._t_rows.splice(index, 1);
        table_ref._rebuild_table();
      };

      return row_element;
    };

    /*
     * TODO Append row to table.
     * */
    table_ref.append_row = function() {};

    /*
     * TODO Prepend row to table (after header, if it is present)
     * */
    table_ref.prepend_row = function() {};

    return table_ref;
  });
}
