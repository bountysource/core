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

  define('backer_box', function(fundraiser) {
    var payment_box_div = Payment.payment_box('Bounty', fundraiser, null, window.location.href);
    return div({ id: 'bounty-box' },
      div({ style: 'padding: 0 21px' }, ribbon_header("Backers")),

//      fundraiser.account_balance > 0 && section(
//        div({ 'class': 'total_bounties' }, money(fundraiser.account_balance)),
//        div({ style: 'text-align: center' }, "From ", fundraiser.bounties.length, " bount" + (fundraiser.bounties.length == 1 ? 'y' : 'ies') + ".")
//      ),
      payment_box_div
    );
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

        fundraiser.image_url && section({ id: 'fundraiser-image', style: 'border-bottom: 2px dotted #C7C7C7; text-align: center;' },
          img({ style: 'max-width: 630px; padding: 20px;', src: fundraiser.image_url })
        ),

        section({ id: 'fundraiser-links', style: 'text-align: right; color: #C5C5C5;' },
          span({ style: 'display: block; margin: 10px 0;' }, 'Created ', date(fundraiser.created_at)),
          fundraiser.homepage_url &&  span({ style: 'display: block; margin: 10px 0;' }, 'Homepage: ', a({ target: '_blank', href: fundraiser.homepage_url, style: 'color: inherit;' }, fundraiser.homepage_url)),
          fundraiser.repo_url &&    span({ style: 'display: block; margin: 10px 0;' }, 'Repository: ', a({ target: '_blank', href: fundraiser.repo_url, style: 'color: inherit;' }, fundraiser.repo_url))
        ),

        // TODO sharing
        section({ id: 'fundraiser-share' }),

        section({ id: 'fundraiser-description', style: 'margin: 20px auto; padding: 10px;' },
          div({ 'class': 'markdown', html: fundraiser.description_html, style: 'margin: 0; padding: 10px; overflow-x: scroll;' })
        )
      ),

      div({ 'class': 'split-side' },
        section({ id: 'fundraiser-stats', style: 'background: #eee; padding: 10px; margin: 10px 0; border-radius: 3px;' },
          ul({ style: 'list-style-type: none; padding: 0;' },
            li({ style: 'margin: 20px auto;' },
              span({ style: 'font-size: 45px; display: inline-block;' }, 15+''), br(), span({ style: 'margin-left: 5px; margin-top: 12px; display: inline-block;' }, 'backers')
            ),
            li({ style: 'margin: 20px auto;' },
              span({ style: 'font-size: 45px; display: inline-block;' }, money(1500)), br(), span({ style: 'margin-left: 5px; margin-top: 12px; display: inline-block;' }, 'pledged of ', money(fundraiser.funding_goal), ' goal')
            )
          )
        ),

        br(),

        section({ id: 'fundraiser-about-me', style: 'background: #D2F8D2; padding: 15px; margin: 10px 0; border-radius: 3px;' },
          div({ style: 'margin-bottom: 5px;' },
            div({ style: 'text-align: left; display: inline-block' }, img({ src: fundraiser.person.avatar_url, style: 'width: 70px; border-radius: 3px;' })),
            div({ style: 'display: inline-block; vertical-align: top; margin-left: 10px;' },
              span({ style: 'font-size: 14px; color: gray;'}, 'Project by'), br(),
              span(fundraiser.person.display_name)
            )
          ),

          // show github profile link if provided by user
          (fundraiser.person.github_user || true) && div({ style: 'border-top: 2px dotted #C7C7C7; padding: 5px;' },
            img({ src: 'images/github.png', style: 'width: 30px; vertical-align: middle' }),
            a({ style: 'vertical-align: middle; margin-left: 10px;', target: '_blank', href: 'https://github.com/'+fundraiser.person.github_user.login }, fundraiser.person.github_user.login)
          ),

          div({ style: 'border-top: 2px dotted #C7C7C7; padding-top: 10px;' },
            div({ style: 'padding: 12px 8px; background: #B0F1B0; border-radius: 3px;' },
              p({ style: 'white-space: pre-wrap; margin: 0;' }, fundraiser.about_me)
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
