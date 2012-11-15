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

    return section({ id: 'fundraiser-wrapper' },
      div({ 'class': 'split-main' },
        section({ id: 'fundraiser-head', style: 'border-bottom: 2px dotted #C7C7C7; padding-bottom: 25px; text-align: center; color: #5e5f5f;' },
          h1({ style: 'font-size: 45px; font-weight: normal; margin: 25px auto;' }, fundraiser.title),
          span({ style: 'font-size: 16px; margin-bottom: 35px;' }, 'by ', fundraiser.person.display_name)
        ),

        // TODO sharing
        section({ id: 'fundraiser-share' }),

        section({ id: 'fundraiser-description', style: 'margin: 20px auto; padding: 10px; background: #F7F7F7; border-radius: 2px; border-radius: 3px;' },
          p({ style: 'margin: 0; white-space: pre-wrap; font-size: 18px; line-height: 35px;' }, fundraiser.description)
        )
      ),

      div({ 'class': 'split-side' },
        grey_box(
          ul({ style: 'list-style-type: none; padding: 0;' },
            li({ style: 'margin: 20px auto;' },
              span({ style: 'font-size: 45px;' }, 15+''), span({ style: 'margin-left: 5px;' }, 'backers')
            ),
            li({ style: 'margin: 20px auto;' },
              span({ style: 'font-size: 45px;' }, money(1500)), span({ style: 'margin-left: 5px;' }, 'backers')
            )
          )
        )
      ),

      div({ 'class': 'split-end' })
    );
  });

  // a layout with no navigation, for simply previewing a fundraiser
  define('fundraiser_preview_layout', function(yield) {
    return section({ id: 'wrapper', style: 'margin: 10px auto;' },
      section({ id: 'content' }, yield)
    )
  });
}