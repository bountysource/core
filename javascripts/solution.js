with (scope('PullRequest', 'App')) {
  route('#solutions', function() {
    var target_div = div('Loading...');

    render(target_div);

    BountySource.user_info(function(response) {
      var info = response.data;

      render({ into: target_div },
        breadcrumbs('My Solutions'),

        table(
          tr(
            th(),
            th('Base Repository'),
            th('Head Repository'),
            th('Head Branch'),
            th('Issue Number'),
            th('Submitted'),
            th('Merged')
          ),

          info.solutions.map(function(s) {
            return tr(
              td(!s.pull_request && a({ href: '#solutions/'+s.base.repository.full_name+'/issues/'+ s.issue.number+'/submit' }, 'Submit Solution')),
              td(a({ href: '#repos/'+s.base.repository.full_name+'/issues/'+s.issue.number }, s.base.repository.full_name)),
              td(s.head.repository.full_name),
              td(s.head.name),
              td(s.issue.number),
              td(!!s.pull_request+''),
              td(!!(s.pull_request && s.pull_request.merged)+'')
            );
          })
        )
      )
    });
  });

  route('#solutions/:login/:repository/issues/:issue_number/submit', function(login, repository, issue_number) {
    render (
      breadcrumbs(
        a({ href: '#repos/search/' + repository }, 'Projects'),
        a({ href: '#repos/' + login + '/' + repository + '/issues' }, login + '/' + repository),
        a({ href: '#repos/' + login + '/' + repository + '/issues/' + issue_number }, 'Issue #' + issue_number),
        ('Submit Solution for Approval')
      ),

      p('This will submit your solution by creating a pull request on the base repository, '+login+'/'+repository),

      form({ action: curry(submit_solution, login, repository, issue_number) },
        div({ id: 'errors'}),

        div(
          span('Title:'),
          input({ name: 'title', placeholder: 'Fixes issue#'+issue_number })
        ),
        div(
          span('Body:'),
          textarea({ name: 'body', style: 'width: 400px; height: 150px;' })
        ),
        submit('Create Pull Request')
      )
    );
  });

  define('submit_solution', function(login, repository, issue_number, form_data) {
    render({ into: 'errors' },'');

    BountySource.submit_solution(login, repository, issue_number, { title: form_data.title, body: form_data.body }, function(response) {
      if (response.meta.success) {
        set_route('#solutions');
      } else {
        render({ into: 'errors' }, div({ style: 'padding: 20px;'}, response.data.error))
      }
    });
  });
};