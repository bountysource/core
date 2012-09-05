with (scope('Repository', 'App')) {
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

  route('#repos/:login/:repository/issues/:issue_number/fork', function(login, repository, issue_number) {
    render(
      h2('Start working on ', repository),
      h3('Fork Repository / Create Solution Branch.'),
      p('To collect this bounty, you must develop your solution on the branch that we create here. The repository will automatically be forked to your account.'),
      shy_form({ action: curry(fork_and_branch, login, repository, issue_number) },
        search({ name: 'branch_name', placeholder: 'issue'+issue_number }),
        submit('Create Branch')
      )
    );
  });

  define('fork_and_branch', function(login, repository, issue_number, form_data) {
    fork(login, repository, issue_number, function(response) {
      if (response.meta.success) {
        var repo = response.data;

        create_branch(repo.owner, repo.name, form_data.branch_name, function(response) {
          console.log(response);
        });
      } else {
        show_shy_form();
      }
    });
  });

  // API helpers

  define('fork', function(login, repository, issue_number, callback) {
    BountySource.api('/github/repos/'+login+'/'+repository+'/issues/'+issue_number+'/fork', 'POST', callback);
  });

  define('create_branch', function(login, repository, branch_name, callback) {
    BountySource.api('/github/repos/'+login+'/'+repository+'/branches', 'POST', { branch_name: branch_name }, callback);
  });
};