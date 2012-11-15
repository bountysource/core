with (scope('Fundraisers')) {
  route('#fundraisers/:fundraiser_id', function(fundraiser_id) {
    var fundraiser_div = div('Loading...');
    var target_div = div(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#fundraisers' }, 'Fundraisers'),
        span({ id: 'breadcrumbs-fundraiser-title' }, 'Loading...')
      ),
      fundraiser_div
    );

    render(target_div);

    BountySource.get_fundraiser(fundraiser_id, function(response) {
      if (response.data.published) {
        render({ into: fundraiser_div }, fundraiser_template(response.data));
      } else {
        render({ target: 'breadcrumbs-fundraiser-title' }, 'Oh no!');
        render({ into: fundraiser_div }, error_message('Fundraiser not found.'));
      }
    });
  });

  route('#fundraisers/:fundraiser_id/preview', function(fundraiser_id) {
    var fundraiser_div = div('Loading...');
    var target_div = div(
      breadcrumbs(
        'Home',
        'Fundraisers',
        span({ id: 'breadcrumbs-fundraiser-title' }, 'Loading...')
      ),
      fundraiser_div
    );

    render({ layout: fundraiser_preview_layout }, target_div);

    BountySource.get_fundraiser(fundraiser_id, function(response) {
      render({ into: fundraiser_div }, fundraiser_template(response.data));
    });
  });



  define('fundraiser_template', function(fundraiser) {
    // add the title to the already present header element
    render({ target: 'breadcrumbs-fundraiser-title' }, fundraiser.title);

    return div(
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
  });

  // a layout with no navigation, for simply previewing a fundraiser
  define('fundraiser_preview_layout', function(yield) {
    return section({ id: 'wrapper', style: 'margin-top: 10px;' },
      section({ id: 'content' }, yield)
    )
  });
}