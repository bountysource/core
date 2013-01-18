with (scope('Fundraisers')) {
  route('#fundraisers/:fundraiser_id', function(fundraiser_id) {
    var fundraiser_div = div('Loading...');
    var target_div = div(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'Fundraisers',
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

    var bountysource_account_div = div();

    var fundraiser_form = section({ id: 'fundraiser-wrapper' },
      div({ 'class': 'split-main' },
        section({ id: 'fundraiser-head', style: 'border-bottom: 2px dotted #C7C7C7; padding-bottom: 10px; text-align: center; color: #5e5f5f;' },
          h1({ style: 'font-size: 45px; font-weight: normal; margin: 25px auto; line-height: 50px;' }, fundraiser.title),

          span('by: '),
          div({ 'class': 'avatar small', style: 'display: inline-block;' },
            a({ href: '#users/'+fundraiser.person.id, style: 'display: inline-block; vertical-align: middle' },
              img({ src: fundraiser.person.avatar_url })
            )
          ),
          div({ style: 'display: inline-block;' }, a({ href: '#users/'+fundraiser.person.id, style: 'margin-left: 5px;' }, fundraiser.person.display_name))
        ),

        fundraiser.image_url && section({ id: 'fundraiser-image', style: 'border-bottom: 2px dotted #C7C7C7; text-align: center;' },
          img({ style: 'max-width: 630px; padding: 20px;', src: fundraiser.image_url })
        ),

        section({ id: 'fundraiser-short-description', style: 'border-bottom: 2px dotted #C7C7C7; color: #5E5F5F;' },
          div({ style: 'margin: 10px 0; padding: 20px; background: #EEE; border-radius: 3px; font-size: 20px; line-height: 25px;' }, fundraiser.short_description||''),

          div({ id: 'fundraiser-links', style: 'margin-left: 20px; font-size: 14px;' },
            span({ style: 'display: block; margin: 10px 0;' }, 'Created ', date(fundraiser.created_at)),
            fundraiser.homepage_url &&  span({ style: 'display: block; margin: 10px 0;' }, 'Homepage: ',  a({ target: '_blank', href: fundraiser.homepage_url, style: 'color: inherit;' }, fundraiser.homepage_url)),
            (fundraiser.repo_url && fundraiser.repo_url != fundraiser.homepage_url) && span({ style: 'display: block; margin: 10px 0;' }, 'Repository: ', a({ target: '_blank', href: fundraiser.repo_url, style: 'color: inherit;' }, fundraiser.repo_url))
          )
        ),

        // TODO sharing
        section({ id: 'fundraiser-share' }),

        section({ id: 'fundraiser-description', style: 'margin: 20px auto; padding: 10px;' },
          div({ 'class': 'markdown', html: fundraiser.description_html, style: 'margin: 0; padding: 10px; overflow-x: auto;' })
        )
      ),

      div({ 'class': 'split-side' },
        section({ id: 'fundraiser-stats', style: 'background: #eee; padding: 10px; margin: 10px 0; border-radius: 3px;' },
          ul({ style: 'list-style-type: none; padding: 0;' },
            li({ style: 'margin: 20px auto;' },
              span({ style: 'font-size: 45px; display: inline-block;' }, fundraiser.backers.length+''), br(), span({ style: 'margin-left: 5px; margin-top: 12px; display: inline-block;' }, 'backer' + (fundraiser.backers.length == 1 ? '' : 's'))
            ),
            li({ style: 'margin: 20px auto;' },
              span({ style: 'font-size: 45px; display: inline-block;' }, money(fundraiser.total_pledged)), br(), span({ style: 'margin-left: 5px; margin-top: 12px; display: inline-block;' }, 'pledged of ', money(fundraiser.funding_goal||0), ' goal')
            )
          ),

          form({ action: curry(make_pledge, fundraiser.id) },
            messages(),

            // disable functionality of pledge button if not published
            fundraiser.published ? [
              a({ 'class': 'green pledge-button', href: '#fundraisers/'+fundraiser.id+'/pledge' }, 'Make a Pledge')
            ] : [
              a({ 'class': 'green pledge-button' }, 'Make a Pledge')
            ]
          )
        ),

        (fundraiser.rewards.length > 0) && section({ id: 'fundraiser-rewards', style: 'background: #EEE; margin: 10px 0; border-radius: 3px;' },
          (function() {
            var elements = [];
            for (var i=0; i<fundraiser.rewards.length; i++) {
              var reward = fundraiser.rewards[i];
              var element = div({ style: 'min-height: 100px; padding: 15px;1', onClick: curry(set_route, '#fundraisers/'+fundraiser.id+'/pledge?reward_id='+reward.id) },
                span({ style: 'font-size: 25px;' }, 'Pledge ', money(reward.amount), ' +'),

                (reward.limited_to > 0) && p({ style: 'margin-left: 10px; font-size: 14px; font-style: italic;' }, 'Limited: ', formatted_number(reward.limited_to - (reward.claimed||0)), ' of ', formatted_number(reward.limited_to), ' left'),

                p({ style: 'margin-left: 10px;' }, reward.description)
              );

              if (i < (fundraiser.rewards.length-1)) element.style['border-bottom'] = '2px dotted #C7C7C7';
              elements.push(element);
            }
            return elements;
          })()
        )
      ),

      div({ 'class': 'split-end' })
    );

    // if logged in and account has money, render bountysource account radio
    logged_in() && BountySource.get_cached_user_info(function(user) {
      (user.account && user.account.balance > 0) && render({ into: bountysource_account_div },
        div(
          radio({
            name: 'payment_method',
            value: 'personal',
            id: 'payment_method_personal'
          }),
          label({ 'for': 'payment_method_personal', style: 'text-align: left; padding-left: 15px; display: inline;' },
            img({ src: user.avatar_url, style: 'width: 16px; height: 16px' }),
            "BountySource",
            span({ style: "color: #888; font-size: 80%" }, " (" + money(user.account.balance) + ")")
          )
        )
      );
    });

    return fundraiser_form;
  });

  // a layout with no navigation, for simply previewing a fundraiser
  define('fundraiser_preview_layout', function(yield) {
    return section({ id: 'wrapper', style: 'margin: 10px auto;' },
      section({ id: 'content' }, yield)
    )
  });
}
