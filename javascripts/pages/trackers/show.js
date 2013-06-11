with (scope()) {

  define('tracker', {
    name: 'JSHint',
    issues: [
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 },
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 },
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 },
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 },
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 },
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 },
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 },
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 },
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 },
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 },
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 },
      { number: 1, title: 'Some awesome issue, omg yes', comment_count: 5, total_bounties: 30.00 }
    ]
  });

  route('#trackers/:issue_id', function(issue_id) {
    //TODO: var issue_id = params.issue_id;

    render(
      ul({ 'class': 'breadcrumb' },
        li(a({ href: "#" }, 'Home'), span({ 'class': 'divider' }, '»')),
        li(a({ href: "#" }, 'JSHint'))
      ),

      div({ 'class': 'row-fluid issue-show' },
        div({ 'class': 'span9' },
          div({ 'class': "well", style: 'color: #333' },
            h3(tracker.name),
            p('lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, ')
          ),

          ul({ 'class': 'nav nav-tabs' },
            li({ 'class': 'active' }, a({ href: '#' }, 'Popular Issues')),
            li(a({ href: '#' }, 'Recent Issues')),
            li(a({ href: '#' }, 'Past Issues'))
          ),

          table({ 'class': 'table table-hover table-bordered table-condensed' },
            tbody(
              tr(
                th('Number'),
                th('Title'),
                th('Comments'),
                th('Bounties')
              ),

              tracker.issues.map(function(issue) {
                return tr({ style: 'cursor: pointer' },
                  td(issue.number),
                  td(issue.title),
                  td(issue.comment_count),
                  td(issue.total_bounties)
                );
              })
            )
          )
        ),
        div({ 'class': 'span3' },
          div({ 'class': "alert alert-success", style: 'color: #333' },
            h3('Overview'),
            p('lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, ')
          )
        )
      )
    );
  });

}