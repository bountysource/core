with (scope('PullRequest', 'App')) {
  route('#solutions', function() {
    var target_div = div('Loading...');

    render(
      breadcrumbs('Issue Branches'),
      target_div
    );

    BountySource.user_info(function(response) {
      var info = response.data;

      // render either a submit pull request, or view pull request button
      var submit_or_view_pull_request_button = function(solution) {
        if (solution.pull_request) {
          return a({ 'class': 'green', target: '_blank', href: solution.pull_request.issue.url }, 'View Pull Request');
        } else {
          return a({ 'class': 'green', href: '#solutions/'+solution.base.repository.full_name+'/issues/'+ solution.issue.number+'/submit' }, 'Submit Solution');
        }
      };

      render({ into: target_div },
        table(
          tr(
            th('Issue'),
            th('Base Repository'),
            th('Head Repository'),
            th('Head Branch'),
            th('Submitted'),
            th('Merged'),
            th('Actions')
          ),

          info.solutions.map(function(s) {
            return tr(
              td(s.issue.number),
              td(a({ href: '#repos/'+s.base.repository.full_name+'/issues/'+s.issue.number }, s.base.repository.full_name)),
              td(s.head.repository.full_name),
              td(s.head.name),
              td(!!s.pull_request+''),
              td(!!(s.pull_request && s.pull_request.merged)+''),
              td(div({ style: 'margin: 10px 0px;' }, submit_or_view_pull_request_button(s)))
            );
          })
        )
      )
    });
  });

  route('#repos/:login/:repository/issues/:issue_number/solution', function(login, repository, issue_number) {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#repos/' + login + '/' + repository }, login + '/' + repository),
        a({ href: '#repos/' + login + '/' + repository + '/issues' }, 'Issues'),
        a({ href: '#repos/' + login + '/' + repository + '/issues/' + issue_number }, '#' + issue_number),
        ('My Issue Branch')
      ),
      target_div
    );

    Issue.get_solution(issue_number, function(solution) {
      if (!solution) {
        set_route('#repos/'+login+'/'+repository+'/issues/'+issue_number);
      } else {
        render({ into: target_div },
          div('Your Fork: ', a({ target: '_blank', href: solution.head.repository.url }, solution.head.repository.full_name)),
          div('Base Repository: ', a({ target: '_blank', href: solution.base.repository.url }, solution.base.repository.full_name)),

          p('Submit your solution as a pull request to the project committers on GitHub. You earn the bounty if your pull request is merged into the base repository, and the underlying issue is closed.'),

          shy_form_during_submit('Submitting Solution...'),
          shy_form({ action: curry(submit_solution, login, repository, issue_number) },
            div({ id: 'errors' }),

            b('Title'),
            input({ name: 'title', value: 'Fixes Issue#'+issue_number }),
            br(),
            b('Body'),
            textarea({ name: 'body' }),
            br(),
            submit('Submit Solution')
          )
        );
      }
    });
  });

  define('submit_solution', function(login, repository, issue_number, form_data) {
    render({ into: 'errors' },'');

    BountySource.submit_solution(login, repository, issue_number, { title: form_data.title, body: form_data.body + ' (Fixes Issue #'+issue_number+')' }, function(response) {
      if (response.meta.success) {
        set_route('#solutions');
      } else {
        show_shy_form();
        render({ into: 'errors' }, div({ style: 'padding: 20px;'}, response.data.error));
      }
    });
  });
};