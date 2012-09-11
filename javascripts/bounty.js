with (scope('Bounty', 'App')) {
  route('#bounties', function() {
    var target_div = div('Loading...');

    render(target_div);

    BountySource.overview(function(response) {
      var data = (response.data||{});

      render({ into: target_div },
        div({ 'class': 'sidebar' },
          h3('Global Stats'),
          ul(
            li('$ paid to date'),
            li('$ paid this month'),
            li('$ waiting to be claimed'),
            li('# of unique patrons')
          )
        ),

        div({ 'class': 'has-sidebar' },
          h2('Available Bounties'),
          div({ style: 'display: block' },
            featured_project_ul('Featured', data.projects.featured),
            featured_project_ul('Popular', data.projects.popular),
            featured_project_ul('Most Worked On', data.projects.most_worked_on),
            featured_project_ul('Newest', data.projects.newest),
            featured_project_ul('Expiring Soon', data.projects.expiring_soon),
            featured_project_ul('Largest Bounty', data.projects.largest_total_bounty)
          )
        )
      );
    });
  });

  // show the bounties that the developer has started working on
  route('#bounties/started/', function(repository, issue_number) {
    var target_div = div('Loading...');

    render(target_div);

    BountySource.get_bounties()
  });
};