with (scope('Repository', 'App')) {

  route('#repos/:login/:repository', function(login, repository) {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        (login + '/' + repository)
      ),

      target_div
    );

    BountySource.get_repository_overview(login, repository, function(response) {
      console.log(response);
      render({ into: target_div },
        h1('Project Page For: ', response.data.full_name, ' (COMING SOON)')
      );
    });
  });

}