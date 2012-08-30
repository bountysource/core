with (scope('App')) {
  define('default_layout', function(yield) {
    return section({ id: 'wrapper' },
      header(
        h1(a({ href: '#' }, 'BountySource'))
      ),
      section({ id: 'content' },
        yield
      ),
      footer(
        ul(
          li(a({ href: '#about' }, 'About')),
          li(a({ href: '#about' }, 'Contact Us')),
          li(a({ href: '#about' }, 'Blog'))
        )
      )
    );
  });

  route('#', function() {
    render(
      h2('Developers'),
      ul(
        li(Github.auth_button),
        li(a({ href: '#bounties' }, 'Find Bounties'))
      ),
      h2('Patrons'),
      ul(
        li(
          "Search: ",
          form({ action: process_search },
            search({ name: 'term', placeholder: 'Project Name' }),
            submit()
          )
        )
      )
    );
  });

  route('#repos/search/:term', function(term) {
    var target_div = div('Loading...');

    render(
      h2('Repositories'),
      target_div
    );

    BountySource.search_repositories(term, function(repositories) {
      render({ into: target_div },
        ul((repositories||[]).map(function(repo) {
          return li(a({ href: '#repos/'+repo.owner+'/'+repo.name+'/issues' }, repo.owner+'/'+repo.name));
        }))
      );
    });
  });

  define('process_search', function(form_data) {
    set_route('#repos/search/'+form_data.term)
  });


  route('#repos/:login/:repository/issues', function(login, repository) {
    var target_div = div('Loading...');

    render(
      h2('Repository - ' + login+'/'+repository + ' - Issues'),
      target_div
    );

    BountySource.get_issues(login, repository, function(issues) {
      render({ into: target_div },
        ul((issues||[]).map(function(issue) {
          return li(a({ href: '#repos/'+login+'/'+repository+'/issues/'+issue.number }, issue.title));
        }))
      );
    });
  });

  route('#repos/:login/:repository/issues/:issue_number', function(login, repository, issue_number) {
    var target_div = div('Loading...');

    render(
      h2('Repository - ' + login+'/'+repository + ' - Issues - #' + issue_number),
      target_div
    );

    BountySource.get_issue(login, repository, issue_number, function(issue) {
      render({ into: target_div },
        p(issue.body),
        issue.labels && issue.labels.length > 0 && div(
          h3('Lables:'),
          ul(issue.labels.map(function(label) { return li(label.name) }))
        )
      )
    });
  });

  route('#about', function() {
    render(
      h2('About'),
      p('this is awesome!')
    );
  });

  // End point for Github login.
  route ('#login/:access_token', function(access_token) {
    Storage.set('access_token',access_token);
    set_route('#');
  });
}