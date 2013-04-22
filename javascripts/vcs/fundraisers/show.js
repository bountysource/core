with (scope()) {

  define('fundraiser', {
    title: 'I want to raise all the monies.',
    description: "So awesome!!!"
  });

  route('#fundraisers/:issue_id', function(issue_id) {
    //TODO: var issue_id = params.issue_id;

    render(
      ul({ 'class': 'breadcrumb' },
        li(a({ href: "#" }, 'Home'), span({ 'class': 'divider' }, '»')),
        li(a({ href: "#" }, 'Fundraisers'), span({ 'class': 'divider' }, '»')),
        li(a({ href: "#" }, fundraiser.title))
      ),

      div({ 'class': 'row-fluid issue-show' },
        div({ 'class': 'span9' },
          div({ 'class': "well", style: 'color: #333' },
            h3(fundraiser.title),
            p(fundraiser.description)
          ),

          ul({ 'class': 'nav nav-tabs' },
            li({ 'class': 'active' }, a({ href: '#' }, 'Details')),
            li(a({ href: '#' }, 'Updates (10)')),
            li(a({ href: '#' }, 'Comments (35)'))
          )

        ),
        div({ 'class': 'span3' },
          div({ 'class': "alert alert-success", style: 'color: #333' },
            h3('Backers ($0)'),
            p('lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, ')
          )
        )

      )
    );
  });

}