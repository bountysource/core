with (scope('Repository', 'App')) {
  route('#bounties', function() {
    var target_div = div('Loading...');

    render(target_div);

    BountySource.overview(function(response) {
      console.log(response)
      
      var data = (response.data||{});

      render({ into: target_div },
        div({ style: 'float: right; width: 170px;' },

          div({ 'class': 'stats', style: 'width: 150px; padding: 10px' },
            h2(money(data.total_paid_to_date)),
            h3({ 'class': 'blue-line' }, 'Paid to Date'),

            h2(money(data.total_paid_this_month)),
            h3({ 'class': 'blue-line' }, 'Paid this Month'),

            h2(money(data.total_unclaimed)),
            h3({ 'class': 'blue-line' }, 'Total Unclaimed'),

            h2(money(data.largest_unclaimed)),
            h3({ 'class': 'blue-line' }, 'Largest Unclaimed'),

            h2(data.distinct_backers_count),
            h3({ 'class': 'orange-line' }, 'Unique Backers')
          )
        ),

        div({ style: 'margin-right: 190px;' },
          div(
            //featured_projects_table({ header_class: 'thick-line-red' }, 'Featured Projects', data.projects.featured),
            issue_table({ header_class: 'thick-line-green' }, 'Featured Issues', data.issues.featured),
            issue_table({ header_class: 'thick-line-blue' }, 'Popular Issues', data.issues.popular),
            issue_table({ header_class: 'thick-line-red' }, 'Most Worked On Issues', data.issues.most_worked_on),
            issue_table({ header_class: 'thick-line-orange' }, 'Newest Issues', data.issues.newest),
            issue_table({ header_class: 'thick-line-green' }, 'Bounties Expiring Soon', data.issues.expiring_soon),
            issue_table({ header_class: 'thick-line-blue' }, 'Largest Bounties', data.issues.largest_total_bounty)
          )
        )
      );
    });
  });

  define('featured_projects_table', function(options, title, projects) {
    if (!projects || projects.length == 0) return;

    return section({ 'class': 'issue-table' },
      h2({ 'class': options.header_class }, title),
      
      table(
        tr(
          projects.map(function(project) { 
            return td(project.display_name);
          })
        )
      )
    );
  });
  
};
