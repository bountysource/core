with (scope('IssueBranch', 'App')) {
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
};