with (scope('App')) {
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
    the_form.onsubmit = function(e) { wrapper.style.display = 'none'; document.getElementById('shy-form-waiting').style.display = ''; };
    return wrapper;
  });

  define('shy_form_during_submit', function() {
    return div({ id: 'shy-form-waiting', style: 'display: none' }, div(arguments));
  });

  define('show_shy_form', function() {
    document.getElementById('shy-form-wrapper').style.display = '';
    document.getElementById('shy-form-waiting').style.display = 'none';
  });
};
