with (scope('Issue', 'App')) {

  route('#repos/:login/:repository/issues', function(login, repository) {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#repos/'+login+'/'+repository }, login + '/' + repository),
        "Issues"
      ),

      target_div
    );

    BountySource.get_issues(login, repository, function(response) {
      if (!response.meta.success) {
        render({ into: target_div }, error_message(response.data.error));
      } else {
        render({ into: target_div },
          Repository.issue_table({ header_class: 'thick-line-green' }, 'All Issues', response.data)
        );
      }
    });
  });

}
