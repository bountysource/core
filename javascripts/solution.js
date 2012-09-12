with (scope('PullRequest', 'App')) {
  route('#issue_branches', function() {
    var target_div = div('Loading...');

    render(
      breadcrumbs('Issue Branches'),
      target_div
    );

    BountySource.user_info(function(response) {
      var info = response.data;

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
              td(div({ style: 'margin: 10px 0px;' }, a({ 'class': 'green', href: '#repos/'+s.base.repository.full_name+'/issues/'+ s.issue.number+'/issue_branch' }, 'View Issue Branch')))
            );
          })
        )
      )
    });
  });

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
            div('Your Fork: ', a({ target: '_blank', href: solution.head.repository.url }, solution.head.repository.full_name)),
            div('Base Repository: ', a({ target: '_blank', href: solution.base.repository.url }, solution.base.repository.full_name))
          ),

          div({ 'class': 'split-side' },
            div({ style: 'background: #F1F1F1; padding: 0 21px 21px 21px; margin: 20px 15px; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC;' },
              shy_form_during_submit('Submitting Solution...'),
              shy_form({ action: curry(submit_solution, login, repository, issue_number) },
                div({ id: 'errors' }),

                ribbon_header('Progress'),
                br(),
                solution.commits.length > 0 && div(
                  h4('Commits'),
                  solution.commits.map(function(commit) {
                    return div(
                      img({ src: commit.user.avatar_url, style: 'width: 35px;' }), commit.sha.substr(0,8)
                    );
                  }),
                  br(),

                  advanced_box,
                  submit({ 'class': 'green' }, 'Submit Solution'),
                  div({ style: 'text-align: right; font-size: 11px' }, '(', a({ href: curry(show, advanced_box) }, 'advanced'), ')')
                )
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
        set_route('#issue_branches');
      } else {
        show_shy_form();
        render({ into: 'errors' }, div({ style: 'padding: 20px;'}, response.data.error));
      }
    });
  });
};