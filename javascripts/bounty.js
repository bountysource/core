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
            li('$' + data.total_paid_to_date + ' paid to date'),
            li('$' + data.total_paid_this_month + ' paid this month'),
            li('$' + data.total_unclaimed + ' total unclaimed'),
            li('$' + data.largest_unclaimed + ' largest unclaimed'),
            li(data.distinct_backers_count + ' unique backers')
          )
        ),

        div({ 'class': 'has-sidebar' },
          h2('Available Bounties'),
          div({ style: 'display: block' },
            featured_issues_ul('Featured', data.issues.featured),
            featured_issues_ul('Popular', data.issues.popular),
            featured_issues_ul('Most Worked On', data.issues.most_worked_on),
            featured_issues_ul('Newest', data.issues.newest),
            featured_issues_ul('Expiring Soon', data.issues.expiring_soon),
            featured_issues_ul('Largest Bounty', data.issues.largest_total_bounty)
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
