with (scope('App')) {
  define('default_layout', function(yield) {
    return section({ id: 'wrapper' },
      header(
        h1(a({ href: '#' }, 'BountySource')),

        // primarily for debugging
        div({ style: 'text-align: right;' },
          Storage.get('access_token') ? [
            a({ href: '#solutions' }, 'My Solutions'),
            ' | ',
            a({ href: BountySource.logout }, 'Logout of GitHub')
          ] : [
            Github.link_requiring_auth({ href: get_route() }, 'Login to GitHub')
          ]
        )
      ),

      section({ id: 'content' },
        yield
      ),
      footer(
        ul(
          li(a({ href: '#faq' }, 'FAQ')),
          li(a({ href: '#' }, 'About')),
          li(a({ href: '#' }, 'Contact Us')),
          li(a({ href: '#' }, 'Blog'))
        )
      )
    );
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
      span({ 'class': 'uparrow-left' }),
      span({ 'class': 'uparrow-right' })
    ));
    
    return div({ id: 'breadcrumbs' }, elements);
  });

  route('#', function() {
    render(
      h2('Developers'),
      ul(
        li(a({ href: '#bounties' }, 'Find Bounties'))
      ),
      h2('Patrons'),
      ul(
        li(
          "Search: ",
          form({ action: function(form_data) { set_route('#repos/search/'+form_data.term) } },
            search({ name: 'term', placeholder: 'Project Name' }),
            submit()
          )
        )
      )
    );
  });

  // End point for Github login.
  route ('#login/:access_token', function(access_token) {
    Storage.set('access_token',access_token);
    set_route(Storage.remove('__return_route__') || '#');
  });

  define('featured_project_ul', function(title, projects) {
    return div({ 'class': 'featured-project' },
      h3(title),
      ul(projects.map(function(p) { return li(a({ href: '#repos/'+p.full_name+'/issues' }, p.name)) }))
    );
  });

  define('shy_form', function() {
    var the_form = form(arguments),
        wrapper = div({ id: 'shy-form-wrapper' }, the_form);
    the_form.onsubmit = function(e) { wrapper.style.display = 'none' };
    return wrapper;
  });

  define('show_shy_form', function() {
    document.getElementById('shy-form-wrapper').style.display = '';
  });
};
