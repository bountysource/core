with (scope('Repository', 'App')) {
  route('#bounties', function() {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        ('All Bounties')
      ),

      target_div
    );

    BountySource.overview(function(response) {
      var data = (response.data||{});

      console.log(data);

      render({ into: target_div },
        div({ 'class': 'split-main' },
          div(
            featured_projects_table({ header_class: 'thick-line-red' }, 'Featured Projects', data.projects.featured),
            issue_table({ header_class: 'thick-line-blue', show_repository: true }, 'Largest Bounties', data.issues.largest_bounties),
            issue_table({ header_class: 'thick-line-green', show_repository: true }, 'Featured Issues', data.issues.featured),
            issue_table({ header_class: 'thick-line-blue', show_repository: true }, 'Popular Issues', data.issues.popular),
            //issue_table({ header_class: 'thick-line-red', show_repository: true }, 'Most Worked On Issues', data.issues.most_worked_on),
            issue_table({ header_class: 'thick-line-orange', show_repository: true }, 'Newest Issues', data.issues.newest),
            issue_table({ header_class: 'thick-line-green', show_repository: true }, 'Bounties Expiring Soon', data.issues.expiring_soon)
          )
        ),

        div({ 'class': 'split-side' },
          div({ 'class': 'stats', style: 'width: 150px; padding: 10px; float: right;' },
            h2(money(data.total_paid_to_date)),
            h3({ 'class': 'blue-line' }, 'Paid to Date'),

            h2(money(data.total_paid_this_month)),
            h3({ 'class': 'blue-line' }, 'Paid this Month'),

            h2(money(data.total_unclaimed)),
            h3({ 'class': 'blue-line' }, 'Total Unclaimed'),

            h2(money(data.most_bounteous_issue_total)),
            h3({ 'class': 'blue-line' }, 'Largest Unclaimed'),

            h2(formatted_number(data.distinct_backers_count)),
            h3({ 'class': 'orange-line' }, 'Unique Backers')
          )
        ),

        div({ 'class': 'split-end' })
      );
    });
  });

  define('featured_projects_table', function(options, title, projects) {
    if (!projects || projects.length == 0) return;

    return section({ 'class': 'issue-table' },
      h2({ 'class': options.header_class }, title),
      table(
        projects.map(function(project) {
          return tr(
            td({ style: 'vertical-align: middle;' }, a({ href: Repository.get_href(project) }, img({ src: project.user.avatar_url, style: 'width: 50px; border-radius: 3px; margin: 0 5px;' }))),
            td(a({ href: Repository.get_href(project) }, project.full_name )),
            td({ style: 'color: #888' }, p({ style: 'width: 250px; min-height: 10px;' }, project.description))
          );
        })
      )
    );
  });
};
