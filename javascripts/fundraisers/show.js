with (scope('Fundraisers')) {
  route('#fundraisers/:fundraiser_id', function(fundraiser_id) {
    var target_div = div(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#fundraisers' }, 'Fundraisers'),
        'Loading...'
      ),
      'Loading...'
    );

    render(target_div);

    BountySource.get_fundraiser(fundraiser_id, function(response) {
      render({ into: target_div }, fundraiser_template(response.data));
    });
  });

  route('#fundraisers/:fundraiser_id/preview', function(fundraiser_id) {
    var target_div = div(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#fundraisers' }, 'Fundraisers'),
        'Loading...'
      ),
      'Loading...'
    );

    render(target_div);

    BountySource.get_fundraiser(fundraiser_id, function(response) {
      render({ into: target_div }, fundraiser_template(response.data));
    });
  });

  define('fundraiser_template', function(fundraiser) {
    return div(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#fundraisers' }, 'Fundraisers'),
        fundraiser.title
      ),

      div({ 'class': 'split-main' },
        h1(fundraiser.title),
        p(fundraiser.description)
      ),

      div({ 'class': 'split-side' },
        grey_box(
          span({ style: 'padding-right: 10px;' }, 'Goal:'), span({ style: 'font-weight: bold;' }, money(fundraiser.funding_goal))
        )
      ),

      div({ 'class': 'split-end' })
    );
  })
}