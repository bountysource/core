with (scope('App')) {
  define('default_layout', function(yield) {
    return section({ id: 'wrapper' },
      header(
        section(
          h1(a({ href: '#' }, span({ 'class': 'bounty' }, 'Bounty'), span({ 'class': 'source' }, 'Source'))),

          ul(
            li(a({ href: '#about' }, 'About')),
            li(a({ href: '#faq' }, 'FAQ')),
            li(a({ href: 'mailto:support@bountysource.com', target: '_blank' }, 'Contact Us')),
            li(a({ href: '#' }, 'Blog')),

            Storage.get('access_token') ? [
              li(a({ href: '#issue_branches' }, 'Issue Branches')),
              li(a({ href: BountySource.logout }, 'Logout'))
            ] : [
              li(a({ href: '#login' }, 'Login'))
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

  define('money', function(value) {
    var parts = parseFloat(value.toString()).toString().split('.');
    return '$' + parts[0] + '.' + ((parts[1]||'') + '00').substr(0,2);
  });

}