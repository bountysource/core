with (scope('PullRequest', 'App')) {
  route('#repos/:login/:repository/issues/:issue_number/issue_branch', function(login, repository, issue_number) {
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
        var advanced_box = div({ id: 'advanced-issue-branch-box', style: "margin: 10px 0; display: none"},
          b('Title: '), br(),
          text({ name: 'title', value: 'Fixes issue#'+solution.issue.number, style: 'width: 100%' }), br(),
          b('Body: '), br(),
          textarea({ name: 'body', style: 'width: 100%; height: 150px' })
        );

        render({ into: target_div },
          div({ 'class': 'split-main' },
            h1('Getting Started'),
            p('git instructions.')
          ),

          div({ 'class': 'split-side' },
            div({ style: 'background: #F1F1F1; padding: 0 21px 21px 21px; margin: 20px 15px; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC;' },
              ribbon_header('GitHub Links'),
              br(),
              a({ 'class': 'green', target: '_blank', href: solution.head.repository.url+'/tree/'+solution.head.name }, 'Your Branch'),
              br(),
              a({ 'class': 'green', target: '_blank', href: solution.base.repository.url }, 'Base Repository')
            ),

            div({ style: 'background: #F1F1F1; padding: 0 21px 21px 21px; margin: 20px 15px; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC;' },
              ribbon_header('Progress'),
              br(),

              shy_form({ action: curry(submit_solution, login, repository, issue_number) },
                solution.commits.length <= 0 ? [
                  span("No commits have been made to your branch.")
                ] : [
                  solution.pull_request ? [
                    p('Your solution has been submitted.'),
                    a({ 'class': 'blue', target: '_blank', href: solution.pull_request.issue.url }, 'View Submission')
                  ] : [
                    shy_form_during_submit('Submitting Solution...'),
                    div(
                      solution.commits.map(function(commit) {
                        return div(
                          img({ src: commit.user.avatar_url, style: 'width: 35px;' }), a({ target: '_blank', href: solution.head.repository.url+'/commit/'+commit.sha }, commit.sha.substr(0,7))
                        );
                      }),
                      br(),
                      div({ id: 'errors' }),
                      advanced_box,
                      submit({ 'class': 'green' }, 'Submit Solution'),
                      div({ style: 'text-align: right; font-size: 11px' }, '(', a({ href: curry(show, advanced_box) }, 'advanced'), ')')
                    )
                  ]
                ]
              )
            )
          ),
          div({ 'class': 'split-end' })
        );
      }
    });
  });

  define('submit_solution', function(login, repository, issue_number, form_data) {
    render({ into: 'errors' },'');

    BountySource.submit_solution(login, repository, issue_number, { title: form_data.title, body: form_data.body + ' (Fixes Issue #'+issue_number+')' }, function(response) {
      if (response.meta.success) {
        set_route('#repos/'+login+'/'+repository+'/issues/'+issue_number+'/issue_branch');
      } else {
        show_shy_form();
        render({ into: 'errors' }, div({ style: 'padding: 20px;'}, response.data.error));
      }
    });
  });
};