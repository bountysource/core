with (scope('App')) {
  define('default_layout', function(yield) {
    return section({ id: 'wrapper' },
      header(
        section(
          h1(a({ href: '#' }, img({ style: 'margin-left: 20px; vertical-align: middle;', src: 'images/logo.png' }))),

          ul(
            //li(a({ href: '#about' }, 'About')),
            li(a({ href: '#faq' }, 'FAQ')),
            li(a({ href: 'mailto:support@bountysource.com', target: '_blank' }, 'Contact Us')),
            //li(a({ href: '#' }, 'Blog')),

            Storage.get('access_token') ? [
              li(a({ href: '#issue_branches' }, 'Issue Branches')),
              li(a({ href: '#contributions' }, 'Contributions')),
              li(a({ href: '#account' }, 'Account')),
              li(a({ href: BountySource.logout }, 'Logout'))
            ] : [
              li(a({ href: '#login' }, 'Login')),
              li(a({ href: '#create_account' }, 'Create Account'))
            ]
          )
        )
      ),

      div({ id: 'before-content'}),

      section({ id: 'content' },
        yield
      ),
      footer("BountySource is a part of ", a({ href: 'https://www.badger.com/' }, 'Badger Inc.'), " All rights reserved. Copyright ©2012, Badger Inc." )
    );
  });
  
  // empty before-content prior to every rendering
  before_filter(function() {
    inner_html('before-content', '');
    show('before-content');
  });

  define('breadcrumbs', function() {
    var elements = [];
    for (var i=0; i < arguments.length; i++) {
      elements.push(span({ 'class': 'crumb' }, arguments[i]));
      elements.push(span({ 'class': 'arrow' }, "»"));
    }
    elements.pop(); // shave off extra arrow
    
    // add the up-arrow inside the last crumb
    var last_elem = elements.pop();
    elements.push(span({ 'class': 'crumb' }, 
      last_elem.childNodes[0],
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
    return '$' + number(parts[0]) + (show_pennies ? '.' + ((parts[1]||'') + '00').substr(0,2) : '');
  });

  define('number', function(n) {
    return (n||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  });

  define('code', function() {
    var args = Array.prototype.slice.call(arguments);
    return pre({ 'class': 'code' }, args.join("\n"));
  });

  define('error_message', function() {
    return div({ 'class': 'error-message' }, arguments);
  });

  define('success_message', function() {
    return div({ 'class': 'success-message' }, arguments);
  });

  define('info_message', function() {
    return div({ 'class': 'info-message' }, arguments);
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
}
