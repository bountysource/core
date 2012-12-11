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
              span({ style: 'font-size: 45px; display: inline-block;' }, fundraiser.backers.length+''), br(), span({ style: 'margin-left: 5px; margin-top: 12px; display: inline-block;' }, 'backer' + (fundraiser.backers.length == 1 ? '' : 's'))
            ),
            li({ style: 'margin: 20px auto;' },
              span({ style: 'font-size: 45px; display: inline-block;' }, money(fundraiser.total_pledged)), br(), span({ style: 'margin-left: 5px; margin-top: 12px; display: inline-block;' }, 'pledged of ', money(fundraiser.funding_goal||0), ' goal')
            )
          ),

          // disable functionality of pledge button if not published
          fundraiser.published ? [
            a({ 'class': 'green pledge-button', href: '#fundraisers/' + fundraiser.id + '/pledge' }, 'Make a Pledge')
          ] : [
            a({ 'class': 'green pledge-button' }, 'Make a Pledge')
          ]
        ),

        br(),

        section({ id: 'fundraiser-about-me', style: 'background: #D2F8D2; padding: 15px; margin: 10px 0; border-radius: 3px;' },
          div({ style: 'margin-bottom: 5px;' },
            div({ style: 'text-align: left; display: inline-block' },
              a({ href: '#users/'+fundraiser.person.display_name }, img({ src: fundraiser.person.avatar_url, style: 'width: 70px; border-radius: 3px;' }))
            ),
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
        ),

        br(),

        (fundraiser.rewards.length > 0) && h2({ style: 'text-align: center;' },'Rewards'),
        section({ id: 'fundraiser-rewards', style: 'background: #EEE; margin: 10px 0; border-radius: 3px;' },
          (function() {
            var elements = [], reward;
            for (var i=0; i<fundraiser.rewards.length; i++) {
              reward = fundraiser.rewards[i];
              var element = div({ style: 'min-height: 100px; padding: 15px;' },
                span({ style: 'font-size: 25px;' }, 'Pledge ', money(reward.amount), ' +'),

                // TODO show number remaining if quantity limited
                (reward.limited_to > 0) && p({ style: 'margin-left: 10px; font-size: 14px; font-style: italic;' }, 'Limited: ', formatted_number(reward.limited_to - (reward.num_claimed||0)), ' of ', formatted_number(reward.limited_to), ' left'),

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
  });

  route('#fundraisers/:fundraiser_id/pledge', function(fundraiser_id) {
    var target_div = div('Loading...'),
        bountysource_account_div = div();

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'Fundraisers',
        span({ id: 'breadcrumbs-fundraiser-title' }, 'Loading...'),
        'Make Pledge'
      ),
      target_div
    );

    BountySource.get_fundraiser(fundraiser_id, function(response) {
      // render the title of the fundraiser into header
      render({ target: 'breadcrumbs-fundraiser-title' }, a({ href: '#fundraisers/'+fundraiser_id }, response.data.title));

      render({ into: target_div },
        div({ 'class': 'split-main' },
          form({ 'class': 'fancy', action: curry(make_pledge, fundraiser_id) },
            messages(),

            fieldset(
              label('Pledge Amount:'),
              span({ style: 'font-size: 30px; vertical-align: middle; padding-right: 5px;' }, '$'), input({ autofocus: true, name: 'amount', placeholder: '25' })
            ),

            // payment method selection
            fieldset({ 'class': 'no-label' },
              div({ 'class': 'payment-method' },
                div(
                  radio({
                    name:     'payment_method',
                    value:    'paypal',
                    id:       'payment_method_paypal',
                    checked:  'checked'
                  }),
                  label({ 'for': 'payment_method_paypal', style: 'text-align: left; padding-left: 15px;' },
                    img({ src: 'images/paypal.png'}), "PayPal"
                  )
                ),
                div(
                  radio({
                    name:   'payment_method',
                    value:  'google',
                    id:     'payment_method_google'
                  }),
                  label({ 'for': 'payment_method_google', style: 'text-align: left; padding-left: 15px;' },
                    img({ src: 'images/google-wallet.png'}), "Google Wallet"
                  )
                ),
                bountysource_account_div
              )
            ),

            // rewards table
            fieldset({ 'class': 'no-label' },
              (response.data.rewards.length <= 0) && table(
                tr(
                  th({ style: 'width: 50px;' }),
                  th()
                ),
                response.data.rewards.map(function(reward) {
                  return tr(
                    td(radio()),
                    td(reward.description)
                  )
                })
              )
            ),

            fieldset({ 'class': 'no-label' },
              submit({ 'class': 'green' }, 'Make Pledge')
            )
          )
        ),

        div({ 'class': 'split-side' }),

        div({ 'class': 'split-end' })
      );

      logged_in() && BountySource.get_cached_user_info(function(user) {
        if (user.account && user.account.balance > 0) {
          render({ into: bountysource_account_div },
            radio({ name: 'payment_method', value: 'personal', id: 'payment_method_account' }),
            label({ 'for': 'payment_method_account', style: 'white-space: nowrap;' },
              img({ src: user.avatar_url, style: 'width: 16px; height: 16px' }),
              "BountySource",
              span({ style: "color: #888; font-size: 80%" }, " (" + money(user.account.balance) + ")")
            )
          );
        }
      });

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
    });
  });

  define('make_pledge', function(fundraiser_id, form_data) {
    // build the redirect_url, with pledge_id placeholder
    form_data.redirect_url = form_data.redirect_url || BountySource.www_host+'#fundraisers/'+fundraiser_id+'/pledges/:pledge_id/receipt';

    BountySource.make_pledge(fundraiser_id, form_data, function(response) {
      if (response.meta.success) {
        if (form_data.payment_method == 'personal') BountySource.set_cached_user_info(null);
        window.location.href = response.data.redirect_url;
      } else {
        render_message(error_message(response.data.error));
      }
    });
  });

  // a layout with no navigation, for simply previewing a fundraiser
  define('fundraiser_preview_layout', function(yield) {
    return section({ id: 'wrapper', style: 'margin: 10px auto;' },
      section({ id: 'content' }, yield)
    )
  });
}
