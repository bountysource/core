with (scope('Repository', 'App')) {
  route('#repos/:login/:repository/issues/:issue_number/fork', function(login, repository, issue_number) {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#repos/' + login + '/' + repository + '/issues' }, login+'/'+repository),
        a({ href: '#repos/' + login + '/' + repository + '/issues/' + issue_number }, 'Issue #' + issue_number),
        ('Start Solution')
      ),

      target_div
    );

    // if the dev has already started a solution, redirect. otherwise, allow them to create repo and branch
    Issue.get_solution(issue_number, function(solution) {
      if (solution) {
        set_route('#repos/'+login+'/'+repository+'/issues/'+issue_number);
      } else {
        render({ into: target_div },
          h3('Fork Repository / Create Solution Branch.'),
          p('To collect this bounty, you must develop your solution on the branch that we create here. The repository will automatically be forked to your account.'),
          shy_form({ action: curry(create_solution, login, repository, issue_number) },
            div({ id: 'errors', style: 'margin: 10px;' }),

            search({ name: 'branch_name', placeholder: 'issue'+issue_number }),
            submit('Create Branch')
          )
        );
      }
    });
  });

  define('create_solution', function(login, repository, issue_number, form_data) {
    BountySource.create_solution(login, repository, issue_number, form_data.branch_name, function(response) {
      if (response.meta.success) {
        set_route('#repos/'+login+'/'+repository+'/issues/'+issue_number);
      } else {
        show_shy_form();
        render({ into: 'errors' }, response.error);
      }
    });
  });
};