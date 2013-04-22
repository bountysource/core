with (scope()) {

  define('issue', {
    title: 'Split pane feature'
  });

  route('#issues/:issue_id', function(issue_id) {
    //TODO: var issue_id = params.issue_id;

    render(
      ul({ 'class': 'breadcrumb' },
        li(a({ href: "#" }, 'Home'), span({ 'class': 'divider' }, '»')),
        li(a({ href: "#" }, 'Trac'), span({ 'class': 'divider' }, '»')),
        li(a({ href: "#" }, '#4553: Stuff here'))
      ),

      div({ 'class': 'row-fluid issue-show' },
        div({ 'class': 'span9' },
          div({ 'class': "well", style: 'color: #333' },
            h3(issue.title),
            p('lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, ')
          ),

          ul({ 'class': 'nav nav-tabs' },
            li({ 'class': 'active' }, a({ href: '#' }, 'Comments (10)')),
            li(a({ href: '#' }, 'Bounties')),
            li(a({ href: '#' }, 'History'))
          ),

          [1,1,1,1,1,1,1,1,1,1].map(function() {
            return div({ 'class': "well", style: 'color: #333' },
              h5('John said fdsafds'),
              p('stuff here')
            );
          })
        ),
        div({ 'class': 'span3' },
          div({ 'class': "alert alert-success", style: 'color: #333' },
            h3('Bounties ($0)'),
            p('lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, ')
          ),

          div({ 'class': "alert alert-info", style: 'color: #333' },
            h3('Developers'),
            p('lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, ')
          ),

          div({ 'class': "alert alert-warning", style: 'color: #333' },
            h3('Developers'),
            p('lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, ')
          ),

          div({ 'class': "alert alert-error", style: 'color: #333' },
            h3('Developers'),
            p('lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, ')
          )
        )
      )
    );
  });

}