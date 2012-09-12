with (scope('Repository', 'App')) {

  route('#repos/:login/:repository', function(login, repository) {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#repos/search/'+repository }, 'Projects'),
        (login + '/' + repository)
      ),

      target_div
    );

    BountySource.get_repository_overview(login, repository, function(response) {
      console.log(response);
      render({ into: target_div },
        "got response"
      );
    });
  });

}