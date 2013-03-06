with (scope('Search', 'App')) {

  route('#search', function() {
    perform(get_params());
  });

  define('search_from_homepage', function(form_data) {
    if (form_data.query.match(/^https?:\/\//)) perform(form_data);
    else set_route('#search?query=' + encodeURIComponent(form_data.query));
  });

  define('perform', function(form_data) {
    var target_div = div(
      div({ style: "text-align: center; margin: 80px 0" },
        div('Searching... please wait.'),
        div(img({ src: 'images/spinner.gif' }))
      )
    );

    // reset homepage layout back to normal
    inner_html('before-content', '');
    show('before-content');
    show('content');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'Search'
      ),

      target_div
    );

    BountySource.search(form_data.query, function(response) {
      var results = response.data||[];

      if (results.redirect_to) {
        set_route(results.redirect_to)
      } else if (results.create_issue) {
        set_route('#issues/new?url=' + encodeURIComponent(form_data.query));
      } else {
        render({ into: target_div },

          Columns.create(),

          Columns.main(
            results.trackers && div(
              h1('Projects Matching Your Search'),
              table(
                tr(
                  th(),
                  th({ style: "width: 150px" }, 'Name'),
                  th('Description')
                ),

                results.trackers.map(function(tracker) {
                  return tr(
                    td(tracker.image_url && img({ src: tracker.image_url, style: 'width: 50px; height: 50px' })),
                    td(a({ href: tracker.frontend_path }, tracker.name)),
                    td(tracker.description)
                  );
                })
              )
            ),

            results.issues && div(
              h1('Issues Matching Your Search'),
              table(
                tr(
                  th('Project'),
                  th('Title'),
                  th('Bounties')
                ),

                results.issues.map(function(issue) {
                  return tr(
                    td(a({ href: issue.tracker.frontend_path }, issue.tracker.name)),
                    td(a({ href: issue.frontend_path }, issue.title)),
                    td(money(issue.bounty_total))
                  );
                })
              )
            )
          ),

          Columns.side(
            div({ 'class': 'info-message' },
              p(b("Don't see what you want?")),
              p("If you don't see the issue you're looking for, you can quickly add it to our database."),
              a({ href: '#issues/new', 'class': 'blue' }, "Add Issue by URL")
            )
          )

        );
      }

    });
  });
};