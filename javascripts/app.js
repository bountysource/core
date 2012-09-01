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
          form({ action: function(form_data) { set_route('#repos/search/'+form_data.term) } },
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

    BountySource.search_repositories(term, function(response) {
      var repositories = response.data||[];

      render({ into: target_div },
        table(
          tr(
            th('Repository'),
            th('Bounties'),
            th('Followers'),
            th('Forks'),
            th('Updated'),
            th('Description')
          ),
          
          (repositories||[]).map(function(repo) {
            return tr(
              td({ style: 'width: 200px' }, a({ href: '#repos/'+repo.owner+'/'+repo.name+'/issues' }, repo.owner+'/'+repo.name)),
              td('$0.00'),
              td(repo.followers),
              td(repo.forks),
              td({ style: 'white-space:nowrap' }, (repo.pushed_at||"").substr(0,10)),
              td({ style: 'color: #888' }, repo.description)
            );
          })
        )
      );
    });
  });

  route('#repos/:login/:repository/issues', function(login, repository) {
    var target_div = div('Loading...');

    render(
      h2(login+'/'+repository + ': Issues'),
      target_div
    );

    BountySource.get_issues(login, repository, function(response) {
      var issues = response.data||[];

      render({ into: target_div },
        table(
          tr(
            th('ID'),
            th('Title'),
            th('Bounties'),
            th('Code'),
            th('Comments'),
            th('State'),
            th('Updated')
          ),
          
          (issues||[]).map(function(issue) {
            return tr(
              td(issue.number),
              td(a({ href: '#repos/'+login+'/'+repository+'/issues/'+issue.number }, issue.title)),
              td('$0.00'),
              td(issue.code ? '✔' : ''),
              td(issue.comments),
              td(issue.state),
              td({ style: 'white-space:nowrap' }, (issue.updated_at||"").substr(0,10))
            )
          })
        )
      );
    });
  });

  route('#repos/:login/:repository/issues/:issue_number', function(login, repository, issue_number) {
    var target_div = div('Loading...');

    render(target_div);

    BountySource.get_issue(login, repository, issue_number, function(response) {
      var issue = response.data||{};

      render({ into: target_div },
        div({ 'class': 'split-main' },
          h2('Repository - ' + login+'/'+repository + ' - Issues - #' + issue_number),
          issue.body.split("\n").map(function(txt) { return div(txt); })
        ),

        div({ 'class': 'split-side' },
          div(
            h1('Create Bounty:'),
            form({ action: curry(create_bounty, login, repository, issue_number) },
              'Amount: $', text({ placeholder: "100.00", name: 'amount', style: "width: 50px" }),
              submit()
            )
          ),
        
          issue.labels && issue.labels.length > 0 && div(
            h3('Lables:'),
            ul(issue.labels)
          )
        ),
        
        div({ 'class': 'split-end' })
      )
    });
  });
  
  define('create_bounty', function(login, repository, issue, form_data) {
    BountySource.create_bounty(login, repository, issue, form_data.amount, function(response) {
      console.log(response)
    });
  });

  route('#bounties', function() {

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